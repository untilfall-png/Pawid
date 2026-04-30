import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tokenStore } from '../lib/api'

export default function AuthCallbackPage() {
  const [params]  = useSearchParams()
  const { login } = useAuth()
  const navigate  = useNavigate()
  const ran       = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const token  = params.get('token')
    const isNew  = params.get('isNew') === 'true'
    const errMsg = params.get('error')

    if (errMsg || !token) {
      navigate(`/login?error=${errMsg || 'oauth_failed'}`, { replace: true })
      return
    }

    // Validar el token con el servidor
    tokenStore.set(token)
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        login({ user: data.user, token, hasPets: data.hasPets })
        navigate(isNew || !data.hasPets ? '/crear?required=true' : '/dashboard', { replace: true })
      })
      .catch(() => {
        tokenStore.clear()
        navigate('/login?error=oauth_failed', { replace: true })
      })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: 'var(--orange)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontFamily: 'var(--font-display)', color: 'var(--color-muted)', fontSize: 14 }}>
        Autenticando...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
