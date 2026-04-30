import { useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Github, Chrome } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [params]  = useSearchParams()

  const from       = location.state?.from?.pathname || '/dashboard'
  const oauthError = params.get('error')

  const oauthMessages = {
    oauth_not_configured: 'OAuth no está configurado aún. Usa email y contraseña.',
    google_failed: 'Error al conectar con Google. Intenta nuevamente.',
    github_failed: 'Error al conectar con GitHub. Intenta nuevamente.',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api.post('/auth/login', { email, password })
      login({ user: data.user, token: data.token, hasPets: data.hasPets })
      navigate(data.hasPets ? from : '/crear?required=true', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px 20px 40px', background: 'var(--color-bg)', position: 'relative',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.10) 0%, transparent 70%)', top: '-10%', right: '-10%' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(138,43,226,0.12) 0%, transparent 70%)', bottom: '-5%', left: '-5%' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--grad-fire)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 20px rgba(255,107,0,0.4)' }}>🐾</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, letterSpacing: 2, background: 'var(--grad-fire)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>PAWID</span>
          </Link>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-muted)', marginTop: 8, fontSize: 14 }}>
            Bienvenido de vuelta
          </p>
        </div>

        {/* Card */}
        <div className="glass-dark rounded-3xl p-8">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>
            Iniciar sesión
          </h1>

          {/* OAuth error */}
          {oauthError && (
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#fca5a5', fontSize: 13, fontFamily: 'var(--font-body)' }}>
              {oauthMessages[oauthError] || 'Error al autenticar. Intenta de nuevo.'}
            </div>
          )}

          {/* OAuth buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <a href="/api/auth/google" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(66,133,244,0.15)'; e.currentTarget.style.borderColor = 'rgba(66,133,244,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            >
              <Chrome size={16} /> Google
            </a>
            <a href="/api/auth/github" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            >
              <Github size={16} /> GitHub
            </a>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-muted)' }}>o con email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', color: '#fca5a5', fontSize: 13, fontFamily: 'var(--font-body)' }}>
                {error}
              </div>
            )}

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-styled"
                style={{ paddingLeft: 40 }}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input-styled"
                style={{ paddingLeft: 40, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', padding: 4 }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-muted)' }}>
            ¿Sin cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--orange)', fontWeight: 600, textDecoration: 'none' }}>
              Crear cuenta gratis
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
