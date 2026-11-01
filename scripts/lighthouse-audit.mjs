import { mkdir, writeFile } from 'node:fs/promises'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'
import { generateReport } from 'lighthouse'

const origin = 'http://127.0.0.1:4173'
const batchId = new Date().toISOString().replace(/[:.]/g, '-')
const reportDirectory = path.resolve('evidence/lighthouse', `batch-${batchId}`)
const lighthouseVersion = '13.6.0'
const categories = ['performance', 'accessibility', 'best-practices', 'seo']
const thresholds = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 90 }
const audits = []
const viteEntry = path.resolve('node_modules/vite/bin/vite.js')
const chromePath = chromium.executablePath()
const chromeProfile = await mkdtemp(path.join(os.tmpdir(), 'kurio-lighthouse-chrome-'))
const chromePort = await getAvailablePort()
const preview = spawn(process.execPath, [viteEntry, 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
})

preview.stdout.on('data', (chunk) => process.stdout.write(`[preview] ${chunk}`))
preview.stderr.on('data', (chunk) => process.stderr.write(`[preview] ${chunk}`))
preview.on('error', (error) => process.stderr.write(`Preview process error: ${error.message}\n`))
const chrome = spawn(chromePath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-crash-reporter',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${chromePort}`,
  '--remote-allow-origins=*',
  `--user-data-dir=${chromeProfile}`,
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] })
let chromeStderr = ''
chrome.stderr.on('data', (chunk) => {
  chromeStderr += chunk.toString()
  if (chromeStderr.length > 8_000) chromeStderr = chromeStderr.slice(-8_000)
})
chrome.on('error', (error) => process.stderr.write(`Chrome process error: ${error.message}\n`))

try {
  await mkdir(reportDirectory, { recursive: true })
  await waitForPreview()
  await waitForChrome()
  const { default: lighthouse } = await import('lighthouse')

  for (const page of [
    { id: 'home', pathname: '/' },
    { id: 'detail', pathname: '/nfts/emerald-ape-042' },
  ]) {
    for (const profile of [
      { id: 'mobile', formFactor: 'mobile', screenEmulation: { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, disabled: false } },
      { id: 'desktop', formFactor: 'desktop', screenEmulation: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false, disabled: false } },
    ]) {
      for (let run = 1; run <= 3; run += 1) {
        const url = new URL(page.pathname, origin).href
        const name = `${page.id}-${profile.id}-run-${run}`
        process.stdout.write(`Lighthouse ${name}: ${url}\n`)
        try {
          const result = await lighthouse(url, {
            logLevel: 'error',
            hostname: '127.0.0.1',
            port: chromePort,
            output: 'json',
            onlyCategories: categories,
            locale: 'pt-BR',
            formFactor: profile.formFactor,
            screenEmulation: profile.screenEmulation,
            throttlingMethod: 'simulate',
            disableStorageReset: false,
          })
          if (!result || result.lhr.runtimeError) {
            throw new Error(result?.lhr.runtimeError?.message ?? 'Lighthouse returned no result.')
          }

          const jsonPath = path.join(reportDirectory, `${name}.json`)
          const htmlPath = path.join(reportDirectory, `${name}.html`)
          await writeFile(jsonPath, JSON.stringify(result.lhr, null, 2))
          await writeFile(htmlPath, generateReport(result.lhr, 'html'))

          const row = {
            page: page.id,
            profile: profile.id,
            run,
            url,
            scores: Object.fromEntries(categories.map((category) => [category, score(result.lhr.categories[category]?.score)])),
            metrics: {
              lcpMs: metric(result.lhr.audits['largest-contentful-paint']?.numericValue),
              cls: metric(result.lhr.audits['cumulative-layout-shift']?.numericValue),
              tbtMs: metric(result.lhr.audits['total-blocking-time']?.numericValue),
            },
            lighthouseVersion: result.lhr.lighthouseVersion,
            browser: result.lhr.environment.networkUserAgent,
            warnings: result.lhr.runWarnings,
            jsonPath: path.relative(process.cwd(), jsonPath),
            htmlPath: path.relative(process.cwd(), htmlPath),
          }
          audits.push(row)
          process.stdout.write(`  scores ${JSON.stringify(row.scores)}; LCP ${row.metrics.lcpMs}ms, CLS ${row.metrics.cls}, TBT ${row.metrics.tbtMs}ms\n`)
        } catch (error) {
          audits.push({ page: page.id, profile: profile.id, run, url, error: error instanceof Error ? error.message : String(error) })
          process.stderr.write(`  FAIL ${name}: ${error instanceof Error ? error.message : String(error)}\n`)
        }
      }
    }
  }

  await writeSummary()
  const failedRuns = audits.filter((audit) => 'error' in audit)
  const incompleteTargets = [...groupAudits()].filter(([, runs]) => (
    runs.length !== 3
    || runs.some((run) => 'error' in run)
    || runs.some((run) => categories.some((category) => typeof run.scores?.[category] !== 'number'))
    || runs.some((run) => ['lcpMs', 'cls', 'tbtMs'].some((key) => typeof run.metrics?.[key] !== 'number'))
  ))
  if (failedRuns.length || audits.length !== 12 || incompleteTargets.length) {
    process.exitCode = 1
    process.stderr.write(`Lighthouse measurement failed: ${failedRuns.length} failed runs; ${incompleteTargets.length} incomplete page/profile groups.\n`)
  } else {
    const belowTargetCount = targetFailures().length
    process.stdout.write(`All 12 Lighthouse runs completed. ${belowTargetCount} below-target medians are reported for README justification.\n`)
  }
} catch (error) {
  await writeSummary().catch(() => undefined)
  process.stderr.write(`Lighthouse audit setup failed: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
} finally {
  chrome.kill('SIGTERM')
  await Promise.race([new Promise((resolve) => chrome.once('exit', resolve)), delay(2_000)])
  if (chrome.exitCode === null) chrome.kill('SIGKILL')
  preview.kill('SIGTERM')
  await Promise.race([new Promise((resolve) => preview.once('exit', resolve)), delay(5_000)])
  if (preview.exitCode === null) preview.kill('SIGKILL')
  await rm(chromeProfile, { recursive: true, force: true })
}

async function getAvailablePort() {
  const server = createServer()
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Could not reserve a DevTools port.')
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  return address.port
}

async function waitForPreview() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (preview.exitCode !== null) throw new Error(`Vite preview exited early with code ${preview.exitCode}.`)
    try {
      const response = await fetch(origin)
      if (response.ok) return
    } catch {
      // Retry until the preview server is accepting requests.
    }
    await delay(500)
  }
  throw new Error(`Vite preview did not become ready at ${origin}.`)
}

async function waitForChrome() {
  const versionUrl = `http://127.0.0.1:${chromePort}/json/version`
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (chrome.exitCode !== null) {
      throw new Error(`Chrome exited with code ${chrome.exitCode}. ${chromeStderr.trim()}`)
    }
    try {
      const response = await fetch(versionUrl)
      if (response.ok) {
        process.stdout.write(`Chrome DevTools ready on port ${chromePort}.\n`)
        return
      }
    } catch {
      // Wait for the explicitly launched browser to expose its DevTools endpoint.
    }
    await delay(500)
  }
  throw new Error(`Chrome DevTools did not become ready at ${versionUrl}. ${chromeStderr.trim()}`)
}

function score(value) {
  return typeof value === 'number' ? Math.round(value * 100) : null
}

function metric(value) {
  return typeof value === 'number' ? Math.round(value * 100) / 100 : null
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
}

function groupAudits() {
  const grouped = new Map()
  for (const audit of audits) {
    const key = `${audit.page}-${audit.profile}`
    const group = grouped.get(key) ?? []
    group.push(audit)
    grouped.set(key, group)
  }
  return grouped
}

function targetFailures() {
  const failures = []
  for (const [target, runs] of groupAudits()) {
    if (runs.length !== 3 || runs.some((run) => 'error' in run)) continue
    for (const category of categories) {
      const values = runs.map((run) => run.scores[category])
      if (values.some((value) => typeof value !== 'number')) {
        failures.push({ target, category, value: null, required: thresholds[category], reason: 'score missing from one or more runs' })
        continue
      }
      const value = median(values)
      if (value < thresholds[category]) failures.push({ target, category, value, required: thresholds[category] })
    }
  }
  return failures
}

async function writeSummary() {
  const failures = targetFailures()
  const groups = [...groupAudits()].map(([target, runs]) => ({
    target,
    runs: runs.length,
    medians: Object.fromEntries(categories.map((category) => [
      category,
      runs.length === 3 && runs.every((run) => !('error' in run))
        && runs.every((run) => typeof run.scores[category] === 'number')
        ? median(runs.map((run) => run.scores[category]))
        : null,
    ])),
    metricMedians: Object.fromEntries(['lcpMs', 'cls', 'tbtMs'].map((metricKey) => [
      metricKey,
      runs.length === 3 && runs.every((run) => !('error' in run))
        && runs.every((run) => typeof run.metrics[metricKey] === 'number')
        ? median(runs.map((run) => run.metrics[metricKey]))
        : null,
    ])),
  }))
  const report = {
    generatedAt: new Date().toISOString(),
    node: process.version,
    lighthouseVersion,
    operatingSystem: `${os.type()} ${os.release()} ${os.arch()}`,
    chromeExecutable: chromium.executablePath(),
    previewOrigin: origin,
    conditions: 'Vite production preview built with VITE_ENABLE_MOCKS=true; Lighthouse mobile emulation 390×844 and desktop emulation 1440×900; simulated throttling; three independent runs per page/profile.',
    thresholds,
    groups,
    audits,
    targetFailures: failures,
  }
  await mkdir(reportDirectory, { recursive: true })
  await writeFile(path.join(reportDirectory, 'summary.json'), JSON.stringify(report, null, 2))

  const lines = [
    '# Lighthouse quality report',
    '',
    `Generated: ${report.generatedAt}`,
    `Node: ${report.node} · Lighthouse: ${lighthouseVersion}`,
    `OS: ${report.operatingSystem}`,
    `Chrome: ${report.chromeExecutable}`,
    `Preview: ${origin} (production build with mocks enabled)`,
    `Conditions: ${report.conditions}`,
    '',
    '| Page/profile | Runs | Performance | Accessibility | Best Practices | SEO | LCP median (ms) | CLS median | TBT median (ms) |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
    ...groups.map((group) => `| ${group.target} | ${group.runs}/3 | ${display(group.medians.performance)} | ${display(group.medians.accessibility)} | ${display(group.medians['best-practices'])} | ${display(group.medians.seo)} | ${display(group.metricMedians.lcpMs)} | ${display(group.metricMedians.cls)} | ${display(group.metricMedians.tbtMs)} |`),
    '',
    `Targets: Performance ≥ ${thresholds.performance}, Accessibility ≥ ${thresholds.accessibility}, Best Practices ≥ ${thresholds['best-practices']}, SEO ≥ ${thresholds.seo}.`,
    '',
    'Individual HTML and JSON reports are stored beside this file. The summary contains per-run scores, LCP, CLS, TBT, browser user agent, and Lighthouse warnings.',
    '',
    audits.filter((audit) => 'error' in audit).map((audit) => `- Failed ${audit.page}-${audit.profile}-run-${audit.run}: ${audit.error}`).join('\n') || 'No failed audit runs.',
    failures.length ? `\nBelow-target medians (reported for README justification; measurements completed):\n${failures.map((item) => `- ${item.target} ${item.category}: ${item.value ?? item.reason} (target ${item.required})`).join('\n')}` : audits.length === 12 ? '\nAll complete medians meet the configured targets.' : `\nAudit incomplete: expected 12 completed runs, found ${audits.length}.`,
    `\nBatch report directory: ${path.relative(process.cwd(), reportDirectory)}/`,
  ]
  await writeFile(path.join(reportDirectory, 'summary.md'), `${lines.join('\n')}\n`)
}

function display(value) {
  return typeof value === 'number' ? String(Math.round(value * 100) / 100) : '—'
}
