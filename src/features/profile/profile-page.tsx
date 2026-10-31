import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { getApiError } from '@/api/errors'
import { AccountLayout } from './account-layout'
import { useChangePassword, useProfile, useUpdateAvatar, useUpdateProfile } from './queries'
import type { UpdateProfilePayload } from '@/types/api'

type ProfileValues = UpdateProfilePayload
const emptyProfile: ProfileValues = { displayName: '', username: '', email: '', ensName: '', walletNickname: '' }

export function ProfilePage() {
  const profile = useProfile(); const update = useUpdateProfile(); const avatar = useUpdateAvatar(); const password = useChangePassword()
  const fileRef = useRef<HTMLInputElement>(null)
  const [values, setValues] = useState<ProfileValues>(emptyProfile)
  const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [confirmation, setConfirmation] = useState('')
  const [passwordError, setPasswordError] = useState(''); const [message, setMessage] = useState('')
  const [avatarInputError, setAvatarInputError] = useState('')
  useEffect(() => { if (profile.data) setValues({ displayName: profile.data.displayName, username: profile.data.username, email: profile.data.email, ensName: profile.data.ensName, walletNickname: profile.data.walletNickname }) }, [profile.data])

  async function saveProfileForm(event: FormEvent) { event.preventDefault(); setMessage(''); try { await update.mutateAsync(values); setMessage('Seus dados foram salvos.') } catch { /* API error rendered below */ } }
  async function savePassword(event: FormEvent) {
    event.preventDefault(); setPasswordError(''); setMessage('')
    if (newPassword.length < 8) { setPasswordError('Use ao menos 8 caracteres.'); return }
    if (newPassword !== confirmation) { setPasswordError('As senhas não coincidem.'); return }
    try { await password.mutateAsync({ currentPassword, newPassword }); setCurrentPassword(''); setNewPassword(''); setConfirmation(''); setMessage('Senha alterada com sucesso.') }
    catch (error) { setPasswordError(getApiError(error).message) }
  }
  async function selectAvatar(file?: File) {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1_500_000) { setAvatarInputError('Escolha uma imagem PNG, JPEG ou WebP de até 1,5 MB.'); return }
    setAvatarInputError('')
    const reader = new FileReader()
    reader.onload = async () => { if (typeof reader.result === 'string') { try { await avatar.mutateAsync({ avatarDataUrl: reader.result }); setMessage('Avatar atualizado.') } catch { /* mutation state shown */ } } }
    reader.readAsDataURL(file)
  }

  return <AccountLayout active="profile">
    {profile.isPending ? <div className="account-panel account-loading" role="status">Carregando seus dados…</div> : profile.isError ? <div className="account-panel" role="alert"><p>{getApiError(profile.error).message}</p><Button variant="outline" onClick={() => void profile.refetch()}>Tentar novamente</Button></div> : <>
      <section className="account-panel profile-panel" aria-labelledby="profile-data-title">
        <div className="profile-panel-heading"><div><h2 id="profile-data-title">Perfil do colecionador</h2></div>
          <div className="avatar-editor"><div className="profile-avatar" aria-label="Avatar do colecionador">{profile.data?.avatarDataUrl ? <img src={profile.data.avatarDataUrl} alt="Avatar do perfil" /> : <span aria-hidden="true">{values.displayName.slice(0, 1).toUpperCase() || 'K'}</span>}</div><div><Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={avatar.isPending}>{avatar.isPending ? 'Enviando…' : 'Alterar avatar'}</Button>{profile.data?.avatarDataUrl && <Button variant="ghost" size="sm" onClick={() => { setAvatarInputError(''); avatar.mutate(undefined) }} disabled={avatar.isPending}>Remover avatar</Button>}<p>PNG, JPG ou WebP · até 1,5 MB</p><input ref={fileRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Selecionar avatar" onChange={(event) => void selectAvatar(event.currentTarget.files?.[0])} /></div></div>
        </div>
        {avatarInputError && <p className="account-error" role="alert">{avatarInputError}</p>}
        {avatar.isError && <p className="account-error" role="alert">{getApiError(avatar.error).message}</p>}
        <form className="account-form" aria-label="Editar dados do perfil" onSubmit={(event) => void saveProfileForm(event)} noValidate>
          <TextField label="Nome de exibição" value={values.displayName} onChange={(value) => setValues({ ...values, displayName: value })} error={update.error ? getApiError(update.error).fields?.displayName : undefined} />
          <TextField label="Nome de usuário" value={values.username} onChange={(value) => setValues({ ...values, username: value })} error={update.error ? getApiError(update.error).fields?.username : undefined} />
          <TextField label="E-mail" type="email" value={values.email} onChange={(value) => setValues({ ...values, email: value })} error={update.error ? getApiError(update.error).fields?.email : undefined} />
          <TextField label="Nome ENS" placeholder="seunome.eth" value={values.ensName} onChange={(value) => setValues({ ...values, ensName: value })} error={update.error ? getApiError(update.error).fields?.ensName : undefined} />
          <TextField label="Apelido da carteira" value={values.walletNickname} onChange={(value) => setValues({ ...values, walletNickname: value })} error={update.error ? getApiError(update.error).fields?.walletNickname : undefined} />
          {update.isError && <p className="account-error" role="alert">{getApiError(update.error).message}</p>}
          <div className="account-form-actions"><Button type="submit" disabled={update.isPending}>{update.isPending ? 'Salvando…' : 'Salvar alterações'}</Button></div>
        </form>
      </section>
      <section className="account-panel" aria-labelledby="password-title"><div className="account-section-heading"><div><p className="eyebrow">Segurança</p><h2 id="password-title">Alterar senha</h2></div></div>
        <form className="account-form password-form" aria-label="Alterar senha" onSubmit={(event) => void savePassword(event)} noValidate>
          <TextField label="Senha atual" type="password" autoComplete="current-password" value={currentPassword} onChange={setCurrentPassword} />
          <TextField label="Nova senha" type="password" autoComplete="new-password" value={newPassword} onChange={setNewPassword} />
          <TextField label="Confirmar nova senha" type="password" autoComplete="new-password" value={confirmation} onChange={setConfirmation} />
          {passwordError && <p className="account-error" role="alert">{passwordError}</p>}
          <div className="account-form-actions"><Button type="submit" disabled={password.isPending}>{password.isPending ? 'Atualizando…' : 'Salvar nova senha'}</Button></div>
        </form>
      </section>
      {message && <p className="account-success" role="status">{message}</p>}
    </>}
  </AccountLayout>
}

function TextField({ label, value, onChange, type = 'text', placeholder, error, autoComplete }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; error?: string; autoComplete?: string }) {
  const id = `profile-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return <label className="account-field" htmlFor={id}><span>{label}</span><input id={id} type={type} value={value} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => onChange(event.currentTarget.value)} />{error && <small id={`${id}-error`} className="account-error">{error}</small>}</label>
}
