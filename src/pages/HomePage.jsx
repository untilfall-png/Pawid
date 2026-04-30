import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CreditCard } from 'lucide-react'
import ParticleField from '../components/ParticleField'

// ─── Video Hero ────────────────────────────────────────────────────────────────
function VideoHero() {
  const navigate = useNavigate()

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 72 }}>
      {/* Radial background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 70% 40%, rgba(255,107,0,0.10) 0%, transparent 60%),
          radial-gradient(ellipse 60% 80% at 30% 70%, rgba(138,43,226,0.14) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 80% 80%, rgba(255,45,140,0.09) 0%, transparent 50%),
          var(--night)`,
      }} />

      {/* Animated gradient orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.13) 0%, transparent 70%)', top: '-20%', right: '-10%', animation: 'float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(138,43,226,0.16) 0%, transparent 70%)', bottom: '-10%', left: '-5%', animation: 'float 11s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,140,0.12) 0%, transparent 70%)', top: '40%', left: '40%', animation: 'pulseGlow 6s ease-in-out infinite' }} />
      </div>

      {/* Particles */}
      <ParticleField count={70} color="#FF6A00" />

      {/* Content grid */}
      <div className="hero-grid" style={{ position: 'relative', zIndex: 2, width: '100%', padding: '0 6%' }}>
        <div>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,183,3,0.10)',
              border: '1px solid rgba(255,183,3,0.25)',
              borderRadius: 100, padding: '6px 18px',
              fontSize: 11, fontWeight: 700,
              letterSpacing: 2, color: 'var(--gold)',
              textTransform: 'uppercase', marginBottom: 24,
              fontFamily: 'var(--font-display)',
            }}
          >
            🐾 Portal Oficial de Mascotas · Chile
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(64px, 9vw, 108px)',
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: -3,
              marginBottom: 8,
            }}
          >
            <span style={{ background: 'var(--grad-fire)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>PAW</span>
            <span style={{ color: '#fff' }}>ID</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 12, letterSpacing: 4,
              textTransform: 'uppercase',
              color: 'rgba(255,230,199,0.5)',
              marginBottom: 14,
            }}
          >
            AMOR · RESPONSABILIDAD · FAMILIA
          </motion.p>

          {/* Subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(18px, 2.2vw, 24px)',
              fontWeight: 600,
              color: 'var(--cream)',
              marginBottom: 12,
            }}
          >
            El Portal Único de Tu Mascota
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15, lineHeight: 1.7,
              color: 'rgba(255,255,255,0.52)',
              maxWidth: 480, marginBottom: 40,
            }}
          >
            Perfil digital completo, cédula de identidad, GPS en tiempo real,
            historial médico, red de cuidadores y mucho más — todo en un lugar.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
          >
            <button className="btn-primary" onClick={() => navigate('/crear')}
              style={{ padding: '16px 36px', fontSize: 15 }}>
              🐾 Crear Perfil Gratis
            </button>
            <button className="btn-ghost" onClick={() => navigate('/cedula')}
              style={{ padding: '16px 36px', fontSize: 15 }}>
              Ver Cédula Digital <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>

        {/* Right: PAWID logo */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="hidden lg:flex"
          style={{ justifyContent: 'center', alignItems: 'center' }}
        >
          <div style={{ position: 'relative', width: 420, height: 420 }}>
            {/* Outer glow ring */}
            <div style={{
              position: 'absolute', inset: -32,
              background: 'radial-gradient(circle, rgba(255,107,0,0.18) 0%, rgba(138,43,226,0.16) 45%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulseGlow 4s ease-in-out infinite',
            }} />
            {/* Spinning outer ring */}
            <div style={{
              position: 'absolute', inset: -36,
              border: '1px solid rgba(255,45,140,0.2)',
              borderRadius: '50%',
              animation: 'spin 28s linear infinite',
            }}>
              <div style={{ position: 'absolute', top: -5, left: '50%', width: 10, height: 10, background: 'var(--fuchsia)', borderRadius: '50%', boxShadow: '0 0 18px var(--fuchsia)' }} />
            </div>
            {/* Inner counter-spin ring */}
            <div style={{
              position: 'absolute', inset: -16,
              border: '1px dashed rgba(255,183,3,0.18)',
              borderRadius: '50%',
              animation: 'spin 18s linear infinite reverse',
            }}>
              <div style={{ position: 'absolute', bottom: -5, left: '50%', width: 8, height: 8, background: 'var(--gold)', borderRadius: '50%', boxShadow: '0 0 12px var(--gold)' }} />
            </div>
            {/* Logo image */}
            <motion.img
              src="/pawid-logo.png"
              alt="PAWID"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '100%', height: '100%',
                objectFit: 'contain',
                borderRadius: '50%',
                filter: 'drop-shadow(0 0 48px rgba(255,107,0,0.55)) drop-shadow(0 0 96px rgba(138,43,226,0.35))',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-bounce" style={{
        position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        color: 'rgba(255,255,255,0.4)',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>Scroll</span>
        <div style={{ width: 24, height: 40, border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 6 }}>
          <div style={{ width: 4, height: 8, background: 'var(--fuchsia)', borderRadius: 2, animation: 'scrollBounce 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    </section>
  )
}

// ─── Stats bar (flat strip like mockup) ───────────────────────────────────────
function CountUp({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1600
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

const STATS = [
  { label: 'Especies registradas', render: () => <CountUp target={12} suffix="+" /> },
  { label: 'Rastreo en tiempo real',    render: () => 'GPS' },
  { label: 'Cuidadores verificados', render: () => <CountUp target={500} suffix="+" /> },
  { label: 'Soporte y protección',   render: () => '24/7' },
]

function StatsBar() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 1, background: 'rgba(255,255,255,0.08)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'relative', zIndex: 2,
    }}>
      {STATS.map(({ label, render }, i) => (
        <div key={label} className="stat-item">
          <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 900, display: 'block' }} className="stat-number">
            {render()}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, marginTop: 4, fontWeight: 500 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Features grid ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🪪', title: 'Cédula Digital PAWID',  desc: 'Identidad oficial única con número PAWID, foto, QR escaneable y datos validados. Válida en veterinarias, viajes y vuelos.',       iconClass: 'fire' },
  { icon: '📍', title: 'GPS & Rastreo',          desc: 'Localiza a tu mascota en tiempo real. Zonas de seguridad configurables, alertas de salida y mapa de calor de zonas frecuentadas.',  iconClass: 'pink' },
  { icon: '🏥', title: 'Historial Médico',       desc: 'Vacunas, enfermedades, operaciones, alergias y tratamientos. Recordatorios automáticos de próximas dosis y controles.',             iconClass: 'cosmic' },
  { icon: '🏠', title: 'Red de Cuidadores',      desc: 'Peluquería, alojamiento, paseos, guardería y más. Cuidadores verificados para cuando salgas de vacaciones.',                       iconClass: 'blue' },
  { icon: '🗺️', title: 'Rutas Pet-Friendly',    desc: 'Trekking, parques, playas y restaurantes pet-friendly. Rutas recomendadas con nivel de dificultad y amenidades.',                  iconClass: 'cream' },
  { icon: '🍎', title: 'Dieta & Ejercicio',      desc: 'Plan nutricional personalizado por especie, raza, edad y peso. Rutinas de ejercicio adaptadas y alimentos prohibidos.',             iconClass: 'violet' },
]

const ICON_STYLES = {
  fire:   { background: 'linear-gradient(135deg, rgba(255,183,3,0.2), rgba(255,107,0,0.2))',    border: '1px solid rgba(255,183,3,0.3)' },
  pink:   { background: 'linear-gradient(135deg, rgba(255,45,140,0.2), rgba(138,43,226,0.2))',  border: '1px solid rgba(255,45,140,0.3)' },
  cosmic: { background: 'linear-gradient(135deg, rgba(138,43,226,0.2), rgba(58,134,255,0.2))',  border: '1px solid rgba(138,43,226,0.3)' },
  blue:   { background: 'linear-gradient(135deg, rgba(58,134,255,0.2), rgba(75,0,130,0.2))',    border: '1px solid rgba(58,134,255,0.3)' },
  cream:  { background: 'linear-gradient(135deg, rgba(255,230,199,0.14), rgba(255,183,3,0.14))',border: '1px solid rgba(255,230,199,0.22)' },
  violet: { background: 'linear-gradient(135deg, rgba(75,0,130,0.22), rgba(138,43,226,0.2))',   border: '1px solid rgba(75,0,130,0.38)' },
}

function FeaturesGrid() {
  const navigate = useNavigate()
  return (
    <section style={{ padding: '100px 8%', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(138,43,226,0.07) 0%, transparent 70%)' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="section-eyebrow">Todo en un lugar</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, marginBottom: 16 }}>
            ¿Qué ofrece <span style={{ background: 'var(--grad-fire)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>PAWID?</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-muted)', maxWidth: 540, margin: '0 auto' }}>
            Un ecosistema completo diseñado para proteger, identificar y cuidar a tu mascota en cada etapa de su vida.
          </p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {FEATURES.map(({ icon, title, desc, iconClass }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="feature-card"
            onClick={() => title === 'Cédula Digital PAWID' && navigate('/crear')}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, marginBottom: 20,
              position: 'relative', zIndex: 1,
              ...ICON_STYLES[iconClass],
            }}>
              {icon}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 10, position: 'relative', zIndex: 1 }}>
              {title}
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-muted)', position: 'relative', zIndex: 1 }}>
              {desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        style={{
          marginTop: 72, padding: '64px 40px', borderRadius: 32,
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255,107,0,0.12), rgba(255,45,140,0.10), rgba(138,43,226,0.12))',
          border: '1px solid rgba(255,107,0,0.2)',
        }}
      >
        <ParticleField count={30} color="#FF6A00" />

        {/* Logo decorativa flotante */}
        <img
          src="/pawid-logo.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', right: -20, bottom: -30,
            width: 260, height: 260,
            objectFit: 'contain',
            opacity: 0.18,
            filter: 'blur(1px) drop-shadow(0 0 40px rgba(255,107,0,0.6))',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 10 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 900, letterSpacing: -1,
            lineHeight: 1, marginBottom: 16,
          }}>
            Tu mascota merece{' '}
            <span style={{ background: 'var(--grad-fire)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              una identidad propia
            </span>
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-muted)', marginBottom: 40, fontSize: 16, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 40px' }}>
            Únete a miles de dueños responsables que ya confían en PAWID para proteger y cuidar a sus mascotas.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/crear')} style={{ padding: '18px 48px', fontSize: 17 }}>
              🐾 Crear Perfil Gratis
            </button>
            <button className="btn-ghost" onClick={() => navigate('/cuidadores')} style={{ padding: '18px 48px', fontSize: 17, border: '2px solid rgba(138,43,226,0.5)' }}>
              Ver Cuidadores <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main>
      <VideoHero />
      <StatsBar />
      <FeaturesGrid />
    </main>
  )
}
