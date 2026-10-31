import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'

import { getApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { sanitizeReturnTo } from '@/features/auth/model'
import { useLogin, useSignup } from '@/features/auth/queries'

type AuthMode = 'login' | 'signup'
type AuthField = 'displayName' | 'email' | 'password' | 'passwordConfirmation'

export function AuthPage({ mode, returnTo }: { mode: AuthMode; returnTo: string }) {
  const navigate = useNavigate()
  const router = useRouter()
  const login = useLogin()
  const signup = useSignup()
  const mutation = mode === 'login' ? login : signup
  const dialogRef = useRef<HTMLElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<AuthField, string>>>({})
  const safeReturnTo = sanitizeReturnTo(returnTo)
  const apiError = mutation.isError ? getApiError(mutation.error) : undefined
  const closeDialog = useCallback(() => {
    void navigate({ to: '/', search: { page: 1, sort: 'recent' } }).then(() => {
      const entryLink = document.querySelector<HTMLAnchorElement>('.site-header .header-action')
      const brandLink = document.querySelector<HTMLAnchorElement>('.site-header .brand')
      ;(entryLink ?? brandLink)?.focus()
    })
  }, [navigate])

  useEffect(() => {
    firstFieldRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && window.innerWidth > 640) {
        event.preventDefault()
        closeDialog()
      }
      if (event.key !== 'Tab' || window.innerWidth <= 640) return
      const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled)') ?? [])]
        .filter((element) => element.getClientRects().length > 0)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeDialog])

  useEffect(() => {
    if (!Object.keys(fieldErrors).length) return
    dialogRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()
  }, [fieldErrors])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    mutation.reset()
    const errors = validateForm(mode, { displayName, email, password, passwordConfirmation })
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    try {
      if (mode === 'login') {
        await login.mutateAsync({ email: email.trim(), password })
      } else {
        await signup.mutateAsync({ displayName: displayName.trim(), email: email.trim(), password, passwordConfirmation })
      }
      router.history.push(safeReturnTo)
    } catch {
      // The mutation state renders the API error below.
    }
  }

  const update = (field: AuthField, setter: (value: string) => void) => (value: string) => {
    setter(value)
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }))
    mutation.reset()
  }

  return (
    <div className={`auth-overlay auth-${mode}`}>
      <div className="auth-desktop-backdrop" aria-hidden="true">
        <div className="auth-backdrop-copy"><p>Bem-vindo à Kurio</p><strong>SEJA DONO DO FUTURO DA ARTE DIGITAL</strong></div>
        <img src="/assets/nfts/emerald-ape.png" alt="" />
      </div>
      <section className="auth-panel" ref={dialogRef} aria-labelledby="auth-title" aria-modal={window.innerWidth > 640} role={window.innerWidth > 640 ? 'dialog' : undefined}>
        <Link className="auth-mobile-brand" to="/" search={{ page: 1, sort: 'recent' }} aria-label="KURIO, início">KURIO</Link>
        <Link className="auth-close" to="/" search={{ page: 1, sort: 'recent' }} aria-label="Fechar autenticação" onClick={(event) => { event.preventDefault(); closeDialog() }}>×</Link>
        <div className="auth-tabs" aria-label="Acesso à conta">
          <Link className={mode === 'login' ? 'is-active' : ''} to="/login" search={{ returnTo: safeReturnTo }}>Entrar</Link>
          <span aria-hidden="true">|</span>
          <Link className={mode === 'signup' ? 'is-active' : ''} to="/signup" search={{ returnTo: safeReturnTo }}>Criar conta</Link>
        </div>
        <h1 id="auth-title" className="auth-title-mobile">{mode === 'login' ? 'Entrar' : 'Criar perfil de colecionador'}</h1>
        <p className="auth-intro">{mode === 'login' ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.' : 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.'}</p>

        <form className="auth-form" aria-label={mode === 'login' ? 'Formulário de acesso' : 'Formulário de cadastro'} onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && <AuthFieldInput id="auth-display-name" label="Nome de usuário" value={displayName} error={fieldErrors.displayName ?? apiError?.fields?.displayName} onChange={update('displayName', setDisplayName)} autoComplete="name" inputRef={firstFieldRef} />}
          <AuthFieldInput id="auth-email" label="E-mail" placeholder={mode === 'login' ? 'contato@email.com' : 'Digite seu e-mail'} value={email} error={fieldErrors.email ?? apiError?.fields?.email} onChange={update('email', setEmail)} autoComplete="email" type="email" inputRef={mode === 'login' ? firstFieldRef : undefined} />
          <AuthFieldInput id="auth-password" label="Senha" value={password} error={fieldErrors.password ?? apiError?.fields?.password} onChange={update('password', setPassword)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} type={showPassword ? 'text' : 'password'} reveal={() => setShowPassword((shown) => !shown)} revealed={showPassword} />
          {mode === 'signup' && <AuthFieldInput id="auth-password-confirmation" label="Confirmar senha" value={passwordConfirmation} error={fieldErrors.passwordConfirmation ?? apiError?.fields?.passwordConfirmation} onChange={update('passwordConfirmation', setPasswordConfirmation)} autoComplete="new-password" type={showConfirmation ? 'text' : 'password'} reveal={() => setShowConfirmation((shown) => !shown)} revealed={showConfirmation} />}
          {mode === 'login' && <button className="auth-forgot" type="button" disabled title="Recuperação de senha não faz parte deste lote">Esqueceu a senha?</button>}
          {apiError && !Object.keys(apiError.fields ?? {}).length && <p className="auth-error" role="alert">{apiError.message}</p>}
          <Button className="auth-submit" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Aguarde…' : mode === 'login' ? 'Entrar' : <><span className="auth-submit-label-desktop">Criar conta</span><span className="auth-submit-label-mobile">Criar perfil</span></>}
          </Button>
        </form>

        <div className="auth-separator"><span>Ou continue com</span></div>
        <div className="auth-social-actions">
          <button type="button" disabled aria-label="Continuar com Google, indisponível"> <strong className="google-mark">G</strong> Continuar com Google</button>
          <button type="button" disabled aria-label="Continuar com Facebook, indisponível"><strong className="facebook-mark">f</strong> Continuar com Facebook</button>
        </div>
        <p className="auth-switch-mobile">{mode === 'login' ? 'Novo na Kurio? ' : 'Já tem uma conta? '}
          <Link to={mode === 'login' ? '/signup' : '/login'} search={{ returnTo: safeReturnTo }}>{mode === 'login' ? 'Crie uma conta' : 'Entre'}</Link>
        </p>
      </section>
      <div className="auth-mobile-bottom-space" aria-hidden="true" />
    </div>
  )
}

function AuthFieldInput({
  id, label, placeholder, value, error, onChange, autoComplete, type = 'text', inputRef, reveal, revealed,
}: {
  id: string
  label: string
  placeholder?: string
  value: string
  error?: string
  onChange: (value: string) => void
  autoComplete: string
  type?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
  reveal?: () => void
  revealed?: boolean
}) {
  const errorId = `${id}-error`
  return (
    <div className={`auth-field${error ? ' has-error' : ''}`}>
      <label className="sr-only" htmlFor={id}>{label}</label>
      <input ref={inputRef} id={id} name={id} type={type} value={value} placeholder={placeholder ?? label} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(event.target.value)} />
      {reveal && <button className="auth-reveal" type="button" aria-label={revealed ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={revealed} onClick={reveal}>{revealed ? '◉' : '◉̸'}</button>}
      {error && <p id={errorId} className="auth-field-error" role="alert">{error}</p>}
    </div>
  )
}

function validateForm(mode: AuthMode, values: { displayName: string; email: string; password: string; passwordConfirmation: string }) {
  const errors: Partial<Record<AuthField, string>> = {}
  if (mode === 'signup' && values.displayName.trim().length < 2) errors.displayName = 'Informe seu nome.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Informe um e-mail válido.'
  if (values.password.length < (mode === 'signup' ? 8 : 1)) errors.password = mode === 'signup' ? 'Use ao menos 8 caracteres.' : 'Informe sua senha.'
  if (mode === 'signup' && values.password !== values.passwordConfirmation) errors.passwordConfirmation = 'As senhas não coincidem.'
  return errors
}
