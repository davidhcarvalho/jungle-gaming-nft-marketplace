import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { getApiError } from '@/api/errors'
import type { Wallet } from '@/types/domain'
import type { WalletPayload } from '@/types/api'
import { AccountLayout } from '@/features/profile/account-layout'
import { useCreateWallet, useSaveWallet, useWallets } from './queries'

const blank: WalletPayload = { address: '', label: '', networkId: 'ethereum', ensName: '', role: 'secondary' }

export function WalletsPage() {
  const wallets = useWallets(); const create = useCreateWallet(); const update = useSaveWallet()
  const [editing, setEditing] = useState<string | null>(null); const [values, setValues] = useState<WalletPayload>(blank); const mutation = editing === 'new' ? create : update
  function beginEdit(wallet?: Wallet) { setEditing(wallet?.id ?? 'new'); setValues(wallet ? { address: wallet.address, label: wallet.label.replace(/ · (Principal|Secundária)$/i, ''), networkId: wallet.networkId, ensName: wallet.ensName ?? '', role: wallet.role } : blank) }
  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      if (editing === 'new') await create.mutateAsync(values)
      else if (editing) await update.mutateAsync({ walletId: editing, payload: values })
      setEditing(null); setValues(blank)
    } catch { /* API error shown inline */ }
  }
  const error = mutation.isError ? getApiError(mutation.error) : undefined
  return <AccountLayout active="wallets">
    {wallets.isPending ? <div className="account-panel account-loading" role="status">Carregando suas carteiras…</div> : wallets.isError ? <div className="account-panel" role="alert"><p>{getApiError(wallets.error).message}</p><Button variant="outline" onClick={() => void wallets.refetch()}>Tentar novamente</Button></div> : <>
      <section className="account-panel wallets-panel" aria-labelledby="wallets-main-title">
        <div className="account-section-heading"><div><h2 id="wallets-main-title">Carteira principal</h2><p>Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p></div><Button onClick={() => beginEdit()} aria-label="Adicionar carteira">Adicionar</Button></div>
        {wallets.data?.wallets.map((wallet) => <article className="wallet-card" key={wallet.id} aria-label={`${wallet.role === 'primary' ? 'Carteira principal' : 'Carteira secundária'}: ${wallet.label}`}>
          <div className="wallet-card-top"><div><span className={`wallet-role ${wallet.role}`}>{wallet.role === 'primary' ? 'Carteira principal' : 'Carteira secundária'}</span><h3>{wallet.label}</h3></div><span className="wallet-network">{wallets.data.networks.find((network) => network.id === wallet.networkId)?.name ?? wallet.networkId}</span></div>
          <dl className="wallet-address"><dt>Endereço</dt><dd title={wallet.address}>{wallet.address}</dd></dl>
          {wallet.ensName && <p className="wallet-ens">ENS: {wallet.ensName}</p>}
          <div className="wallet-actions"><Button variant="outline" size="sm" onClick={() => beginEdit(wallet)}>Editar carteira</Button>{wallet.role !== 'primary' && <Button variant="ghost" size="sm" disabled={update.isPending} onClick={() => void update.mutateAsync({ walletId: wallet.id, payload: { address: wallet.address, label: wallet.label.replace(/ · Secundária$/i, ''), networkId: wallet.networkId, ensName: wallet.ensName, role: 'primary' } }).catch(() => undefined)}>Tornar principal</Button>}</div>
        </article>)}
      </section>
      {editing && <section className="account-panel wallet-editor" aria-labelledby="wallet-editor-title"><div className="account-section-heading"><div><p className="eyebrow">Carteira</p><h2 id="wallet-editor-title">{editing === 'new' ? 'Adicionar carteira' : 'Editar carteira'}</h2></div><Button variant="ghost" size="sm" onClick={() => { setEditing(null); setValues(blank) }}>Cancelar</Button></div>
        <form className="account-form" aria-label={editing === 'new' ? 'Adicionar carteira' : 'Editar carteira'} onSubmit={(event) => void submit(event)} noValidate>
          <Field label="Apelido da carteira" value={values.label} onChange={(label) => setValues({ ...values, label })} error={error?.fields?.label} />
          <label className="account-field"><span>Rede</span><select aria-label="Rede" value={values.networkId} onChange={(event) => setValues({ ...values, networkId: event.currentTarget.value })}>{wallets.data?.networks.map((network) => <option key={network.id} value={network.id}>{network.name}</option>)}</select>{error?.fields?.networkId && <small className="account-error">{error.fields.networkId}</small>}</label>
          <Field label="Endereço da carteira" value={values.address} onChange={(address) => setValues({ ...values, address })} error={error?.fields?.address} />
          <Field label="Nome ENS (opcional)" value={values.ensName ?? ''} onChange={(ensName) => setValues({ ...values, ensName })} error={error?.fields?.ensName} />
          {editing !== 'new' && <label className="account-field"><span>Tipo de carteira</span><select aria-label="Tipo de carteira" value={values.role} onChange={(event) => setValues({ ...values, role: event.currentTarget.value as Wallet['role'] })}><option value="primary">Principal</option><option value="secondary">Secundária</option></select></label>}
          {error && !error.fields && <p className="account-error" role="alert">{error.message}</p>}
          <div className="account-form-actions"><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando…' : editing === 'new' ? 'Salvar carteira' : 'Salvar alterações'}</Button></div>
        </form>
      </section>}
    </>}
  </AccountLayout>
}

function Field({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) {
  const id = `wallet-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return <label className="account-field" htmlFor={id}><span>{label}</span><input id={id} value={value} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => onChange(event.currentTarget.value)} />{error && <small id={`${id}-error`} className="account-error">{error}</small>}</label>
}
