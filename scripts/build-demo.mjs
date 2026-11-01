import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

const typescript = path.resolve('node_modules/typescript/bin/tsc')
const vite = path.resolve('node_modules/vite/bin/vite.js')

run(process.execPath, [typescript, '-b'])
run(process.execPath, [vite, 'build'], {
  env: { ...process.env, VITE_ENABLE_MOCKS: 'true' },
})

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
