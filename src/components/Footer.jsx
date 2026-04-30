import { Link } from 'react-router-dom'

const LINKS = [
  { group: 'Servicios', items: [
    { label: 'Crear Perfil',       to: '/crear' },
    { label: 'Cédula PAWID',       to: '/cedula' },
    { label: 'Rastreo GPS',        to: '#' },
    { label: 'Red de Cuidadores',  to: '/cuidadores' },
    { label: 'Dieta & Nutrición',  to: '/dieta' },
    { label: '🩺 Dr. Patitas',     to: '/veterinario' },
  ]},
  { group: 'Explorar', items: [
    { label: 'Rutas Pet-Friendly', to: '/rutas' },
    { label: 'Hoteles Pet',        to: '#' },
    { label: 'Restaurantes Pet',   to: '#' },
    { label: 'Playas Pet',         to: '#' },
    { label: 'PawFeed Social',     to: '#' },
  ]},
  { group: 'PAWID', items: [
    { label: 'Para Veterinarias',  to: '#' },
    { label: 'Para Cuidadores',    to: '#' },
    { label: 'Adopción',           to: '#' },
    { label: 'Términos de uso',    to: '#' },
    { label: 'Privacidad',         to: '#' },
  ]},
]

const SOCIALS = [
  { label: 'Instagram', emoji: '📸', href: '#' },
  { label: 'TikTok',    emoji: '🎵', href: '#' },
  { label: 'Facebook',  emoji: '👥', href: '#' },
  { label: 'WhatsApp',  emoji: '💬', href: '#' },
]

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.07)',
      padding: '60px 8% 40px',
      fontFamily: 'var(--font-body)',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
    }}>
      {/* Top gradient accent */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 2,
        background: 'linear-gradient(90deg, transparent, var(--orange), var(--fuchsia), transparent)',
      }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
        {/* Brand */}
        <div>
          {/* Logo image */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <div style={{
              position: 'absolute', inset: -12,
              background: 'radial-gradient(circle, rgba(255,107,0,0.2) 0%, rgba(138,43,226,0.12) 50%, transparent 70%)',
              borderRadius: '50%',
            }} />
            <img
              src="/pawid-logo.png"
              alt="PAWID"
              style={{
                width: 110, height: 110,
                objectFit: 'contain',
                borderRadius: '50%',
                filter: 'drop-shadow(0 0 18px rgba(255,107,0,0.5)) drop-shadow(0 0 36px rgba(138,43,226,0.3))',
                position: 'relative',
              }}
            />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28, fontWeight: 900, letterSpacing: 3,
            background: 'var(--grad-fire)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: 12,
          }}>
            🐾 PAWID
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, maxWidth: 240, marginBottom: 20 }}>
            El Portal Único de Tu Mascota. Identidad, protección y cuidado en un solo lugar.
          </p>
          <p style={{ fontStyle: 'italic', fontSize: 12, color: 'rgba(255,230,199,0.4)', letterSpacing: 2, marginBottom: 20 }}>
            Amor · Responsabilidad · Familia ♥
          </p>
          {/* Socials */}
          <div style={{ display: 'flex', gap: 10 }}>
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} title={s.label} style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, textDecoration: 'none',
                transition: 'border-color 0.25s, background 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--fuchsia)'; e.currentTarget.style.background = 'rgba(255,45,140,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.background = 'transparent' }}
              >
                {s.emoji}
              </a>
            ))}
          </div>
        </div>

        {/* Link groups */}
        {LINKS.map(({ group, items }) => (
          <div key={group}>
            <h4 style={{
              fontFamily: 'var(--font-display)', fontSize: 12,
              fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)', marginBottom: 16,
            }}>{group}</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingTop: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
          © 2025 PAWID · Portal Oficial de Mascotas · Chile 🇨🇱
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Términos', 'Privacidad', 'Cookies'].map(l => (
            <Link key={l} to="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
            >{l}</Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
