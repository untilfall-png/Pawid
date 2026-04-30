import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Construction, ArrowLeft } from 'lucide-react'

export default function PlaceholderPage({ title = 'Próximamente', icon = '🚧', description }) {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 24px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center"
      >
        <div style={{ fontSize: 72, marginBottom: 16 }}>{icon}</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 12 }}>
          {title}
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-muted)', maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.7 }}>
          {description || 'Este módulo está en desarrollo activo. Muy pronto disponible en PAWID.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button className="btn-ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Volver
          </button>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      </motion.div>
    </div>
  )
}
