import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Map, Plus, Users, Stethoscope } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const ITEMS = [
  { label: 'Inicio',      path: '/',            icon: Home },
  { label: 'Rutas',       path: '/rutas',       icon: Map },
  { label: null,          path: '/crear',       icon: Plus }, // CTA central
  { label: 'Cuidadores',  path: '/cuidadores',  icon: Users },
  { label: 'Dr. Patitas', path: '/veterinario', icon: Stethoscope },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 998,
        background: 'rgba(5,11,44,0.97)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 4px',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      {ITEMS.map(({ label, path, icon: Icon }) => {
        const isCTA = label === null
        const active = !isCTA && (location.pathname === path || (path !== '/' && location.pathname.startsWith(path)))

        if (isCTA) {
          const ctaDest = isAuthenticated ? path : '/login'
          return (
            <button key={path} onClick={() => navigate(ctaDest)}
              style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'var(--grad-fire)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(255,107,0,0.5)',
                transform: 'translateY(-8px)',
                flexShrink: 0,
              }}
            >
              <Icon size={22} color="#fff" strokeWidth={2.5} />
            </button>
          )
        }

        return (
          <Link key={path} to={path}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              textDecoration: 'none', padding: '4px 10px', borderRadius: 12,
              color: active ? '#fff' : 'rgba(255,255,255,0.4)',
              minWidth: 48, position: 'relative',
            }}
          >
            {active && (
              <motion.div layoutId="bottom-nav-indicator"
                style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 24, height: 2, borderRadius: 2,
                  background: 'var(--grad-fire)',
                }}
              />
            )}
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{
              fontFamily: 'var(--font-sub)', fontSize: 9, fontWeight: active ? 700 : 400,
              letterSpacing: 0.3, whiteSpace: 'nowrap',
            }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
