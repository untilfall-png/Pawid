import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, LogOut, UserCircle2, Plus } from 'lucide-react'
import { usePets } from '../context/PetContext'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { label: 'Inicio',      path: '/' },
  { label: 'Dashboard',   path: '/dashboard' },
  { label: 'Cuidadores',  path: '/cuidadores' },
  { label: 'Rutas',       path: '/rutas' },
  { label: 'Dieta',       path: '/dieta' },
  { label: 'Dr. Patitas', path: '/veterinario' },
]

const SPECIES_EMOJI = { dog:'🐕', cat:'🐈', rabbit:'🐰', bird:'🦜', reptile:'🦎', fish:'🐠', hamster:'🐹', other:'🐾' }

export default function Navigation() {
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu,   setUserMenu]   = useState(false)
  const { pets, activePetId } = usePets()
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const activePet = pets.find(p => p.id === activePetId) || pets[0]

  const handleLogout = () => {
    logout()
    setUserMenu(false)
    navigate('/')
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          padding: '0 5%', height: 72,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled ? 'rgba(5,11,44,0.97)' : 'rgba(5,11,44,0.85)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
          transition: 'background 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--grad-fire)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 4px 16px rgba(255,107,0,0.4)',
          }}>🐾</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22, fontWeight: 900,
            letterSpacing: 2,
            background: 'var(--grad-fire)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>PAWID</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 28 }}>
          {NAV_ITEMS.map(({ label, path }) => {
            const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
            return (
              <Link key={path} to={path} style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13, fontWeight: 600,
                color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                letterSpacing: 0.5,
                position: 'relative',
                transition: 'color 0.2s',
                paddingBottom: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = active ? '#fff' : 'rgba(255,255,255,0.6)'}
              >
                {label}
                {/* underline indicator */}
                <span style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 2, borderRadius: 2,
                  background: 'var(--grad-fire)',
                  transform: active ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.3s',
                  transformOrigin: 'left',
                }} />
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 10 }}>
          {isAuthenticated ? (
            <>
              {/* Active pet chip */}
              {activePet && (
                <button onClick={() => navigate('/cedula')} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 14px', borderRadius: 100,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 13, cursor: 'none',
                  transition: 'all 0.25s',
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--fuchsia)'; e.currentTarget.style.background = 'rgba(255,45,140,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: activePet.photo ? `url(${activePet.photo}) center/cover` : 'rgba(255,107,0,0.4)',
                    border: '2px solid var(--orange)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0,
                  }}>
                    {!activePet.photo && (SPECIES_EMOJI[activePet.species] || '🐾')}
                  </div>
                  <span>{activePet.name}</span>
                  {pets.length > 1 && <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>+{pets.length - 1}</span>}
                </button>
              )}

              <button onClick={() => navigate('/crear')} className="btn-primary btn-sm">
                <Plus size={14} />
                {pets.length === 0 ? 'Registrar mascota' : 'Nueva mascota'}
              </button>

              {/* User avatar + dropdown */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setUserMenu(v => !v)} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--grad-cosmic)',
                  border: '2px solid rgba(138,43,226,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', cursor: 'none', fontSize: 14, fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fuchsia)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(138,43,226,0.5)'}
                >
                  {user?.name?.[0]?.toUpperCase() || <UserCircle2 size={18} />}
                </button>

                <AnimatePresence>
                  {userMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: 44, right: 0,
                        background: 'rgba(5,11,44,0.98)', backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
                        padding: 8, minWidth: 180, zIndex: 100,
                      }}
                    >
                      <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 4 }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#fff' }}>{user?.name || 'Usuario'}</p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-muted)', marginTop: 1 }}>{user?.email}</p>
                      </div>
                      <button onClick={handleLogout} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 12px', borderRadius: 10, background: 'transparent',
                        border: 'none', color: '#FCA5A5', cursor: 'pointer',
                        fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={14} /> Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} style={{
                padding: '8px 18px', borderRadius: 100, background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)',
                fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, cursor: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
              >
                <LogIn size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Iniciar sesión
              </button>
              <button onClick={() => navigate('/register')} className="btn-primary btn-sm">
                Registrarse gratis
              </button>
            </>
          )}
        </div>
      </motion.nav>

      {/* Mobile user dropdown (auth only, nav goes to BottomNav) */}
      <AnimatePresence>
        {userMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{
              position: 'fixed', top: 76, right: 12, zIndex: 999,
              background: 'rgba(5,11,44,0.98)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
              padding: 10, minWidth: 200,
            }}
          >
            <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 6 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>{user?.name}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{user?.email}</p>
            </div>
            <button onClick={handleLogout} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', borderRadius: 10, background: 'transparent',
              border: 'none', color: '#FCA5A5', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
            }}>
              <LogOut size={14} /> Cerrar sesión
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
