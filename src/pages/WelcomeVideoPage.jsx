import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { usePets } from '../context/PetContext'
import { useAuth } from '../context/AuthContext'
import { Shield, MapPin, Heart, Stethoscope, Users, Map, Apple, CreditCard, ChevronRight, Star, Zap } from 'lucide-react'

const FRAMES = [
  { id: 'welcome',    duration: 4.5 },
  { id: 'identity',   duration: 5.5 },
  { id: 'cedula',     duration: 3 },
  { id: 'gps',        duration: 3 },
  { id: 'medical',    duration: 3 },
  { id: 'cuidadores', duration: 3 },
  { id: 'rutas',      duration: 3 },
  { id: 'drpatitas',  duration: 3 },
  { id: 'dieta',      duration: 3 },
  { id: 'finale',     duration: 6 },
]

const SPECIES_EMOJI = { dog:'🐕', cat:'🐈', rabbit:'🐰', bird:'🦜', reptile:'🦎', fish:'🐠', hamster:'🐹', other:'🐾' }

// ─── Shared animation helpers ──────────────────────────────────────────────────
const fadeUp   = (delay = 0) => ({ initial:{ opacity:0, y:32 }, animate:{ opacity:1, y:0 }, transition:{ duration:0.7, delay, ease:[0.22,1,0.36,1] } })
const fadeIn   = (delay = 0) => ({ initial:{ opacity:0 }, animate:{ opacity:1 }, transition:{ duration:0.6, delay } })
const scaleIn  = (delay = 0) => ({ initial:{ opacity:0, scale:0.7 }, animate:{ opacity:1, scale:1 }, transition:{ duration:0.7, delay, type:'spring', stiffness:120 } })
const slideIn  = (delay = 0, x = 60) => ({ initial:{ opacity:0, x }, animate:{ opacity:1, x:0 }, transition:{ duration:0.6, delay, ease:[0.22,1,0.36,1] } })

// ─── Frame: WELCOME ───────────────────────────────────────────────────────────
function FrameWelcome({ user }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:0 }}>
      {/* Orbs */}
      <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 65%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', animation:'pulseGlow 3s ease-in-out infinite' }} />
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(138,43,226,0.18) 0%, transparent 65%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', animation:'pulseGlow 4s ease-in-out infinite reverse' }} />

      {/* Logo with rings */}
      <motion.div {...scaleIn(0.3)} style={{ position:'relative', marginBottom:40, zIndex:1 }}>
        {/* Outer spin ring */}
        <div style={{ position:'absolute', inset:-44, border:'1px solid rgba(255,45,140,0.25)', borderRadius:'50%', animation:'spin 20s linear infinite' }}>
          <div style={{ position:'absolute', top:-6, left:'50%', width:12, height:12, background:'var(--fuchsia)', borderRadius:'50%', boxShadow:'0 0 20px var(--fuchsia)' }} />
        </div>
        {/* Inner spin ring */}
        <div style={{ position:'absolute', inset:-20, border:'1px dashed rgba(255,183,3,0.3)', borderRadius:'50%', animation:'spin 12s linear infinite reverse' }}>
          <div style={{ position:'absolute', bottom:-5, left:'50%', width:10, height:10, background:'var(--gold)', borderRadius:'50%', boxShadow:'0 0 14px var(--gold)' }} />
        </div>
        <img src="/pawid-logo.png" alt="PAWID"
          style={{ width:220, height:220, objectFit:'contain', borderRadius:'50%', filter:'drop-shadow(0 0 60px rgba(255,107,0,0.6)) drop-shadow(0 0 120px rgba(138,43,226,0.4))', position:'relative', zIndex:1 }}
        />
      </motion.div>

      {/* Eyebrow */}
      <motion.div {...fadeIn(1.0)} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,183,3,0.12)', border:'1px solid rgba(255,183,3,0.3)', borderRadius:100, padding:'6px 20px', marginBottom:16 }}>
        <Star size={12} color="var(--gold)" fill="var(--gold)" />
        <span style={{ fontFamily:'var(--font-display)', fontSize:11, fontWeight:700, letterSpacing:3, color:'var(--gold)', textTransform:'uppercase' }}>Registro oficial · Chile</span>
        <Star size={12} color="var(--gold)" fill="var(--gold)" />
      </motion.div>

      {/* Main title */}
      <motion.h1 {...fadeUp(1.3)} style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px,6vw,80px)', fontWeight:900, lineHeight:1, letterSpacing:-2, textAlign:'center', marginBottom:14, zIndex:1 }}>
        ¡Bienvenido/a al<br />
        <span style={{ background:'var(--grad-fire)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Mundo PAWID</span>
        <span style={{ color:'#fff' }}>!</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p {...fadeIn(2.0)} style={{ fontFamily:'var(--font-body)', fontSize:'clamp(14px,2vw,20px)', color:'rgba(255,230,199,0.7)', letterSpacing:2, textAlign:'center' }}>
        {user?.name ? `Hola, ${user.name} 👋` : 'La familia más grande de mascotas de Chile'}<br />
        <span style={{ fontSize:'0.7em', letterSpacing:4, textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>Amor · Responsabilidad · Familia</span>
      </motion.p>

      {/* Floating emoji */}
      {['🐕','🐱','🐰','🦜','🐾'].map((e, i) => (
        <motion.span key={e}
          initial={{ opacity:0, y:20 }} animate={{ opacity:0.5, y:0 }} transition={{ delay: 2.5 + i * 0.12 }}
          style={{ position:'absolute', fontSize:24, animation:'float 4s ease-in-out infinite', animationDelay:`${i * 0.8}s`,
            top: `${20 + (i % 3) * 25}%`, left: i < 3 ? `${8 + i * 5}%` : `${82 + (i-3) * 6}%` }}
        >{e}</motion.span>
      ))}
    </div>
  )
}

// ─── Frame: IDENTITY ─────────────────────────────────────────────────────────
function FrameIdentity({ pet }) {
  if (!pet) return null
  const qrValue = JSON.stringify({ pawid:pet.pawid, name:pet.name, species:pet.species, url:`${window.location.origin}/perfil/${pet.pawid}` })
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:0, padding:'0 5%' }}>
      {/* Confetti orb */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(138,43,226,0.2) 0%, transparent 60%)' }} />

      {/* Celebration badge */}
      <motion.div {...scaleIn(0.2)} style={{ fontSize:64, marginBottom:16, filter:'drop-shadow(0 0 30px rgba(255,183,3,0.6))' }}>
        🎉
      </motion.div>

      {/* Pet name */}
      <motion.h1 {...fadeUp(0.5)} style={{ fontFamily:'var(--font-display)', fontSize:'clamp(40px,7vw,96px)', fontWeight:900, letterSpacing:-3, lineHeight:1, textAlign:'center', background:'var(--grad-fire)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:6 }}>
        {pet.name}
      </motion.h1>
      <motion.p {...fadeIn(0.9)} style={{ fontFamily:'var(--font-body)', fontSize:'clamp(14px,2vw,20px)', color:'rgba(255,255,255,0.6)', marginBottom:28, textAlign:'center' }}>
        {SPECIES_EMOJI[pet.species] || '🐾'} ya es parte oficial de PAWID
      </motion.p>

      {/* PAWID number + QR row */}
      <div style={{ display:'flex', gap:24, alignItems:'center', flexWrap:'wrap', justifyContent:'center' }}>
        {/* Number box */}
        <motion.div {...slideIn(1.1, -60)} style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,183,3,0.4)', borderRadius:20, padding:'20px 32px', backdropFilter:'blur(20px)' }}>
          <p style={{ fontFamily:'var(--font-sub)', fontSize:10, letterSpacing:3, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', marginBottom:8 }}>Número PAWID Oficial</p>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'clamp(16px,2.5vw,28px)', fontWeight:700, color:'var(--gold)', letterSpacing:3 }}>{pet.pawid}</p>
          <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
            {[
              { label:'Registro Oficial', color:'#10B981' },
              { label:'Chile 🇨🇱', color:'#3A86FF' },
              { label:'ID Único', color:'var(--gold)' },
            ].map(({ label, color }) => (
              <span key={label} style={{ background:`${color}18`, border:`1px solid ${color}40`, borderRadius:100, padding:'3px 10px', fontSize:10, color, fontFamily:'var(--font-sub)', fontWeight:600 }}>{label}</span>
            ))}
          </div>
        </motion.div>

        {/* QR code */}
        <motion.div {...scaleIn(1.4)} style={{ background:'white', borderRadius:20, padding:14, boxShadow:'0 8px 40px rgba(0,0,0,0.5)', display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <QRCodeSVG value={qrValue} size={110} bgColor="white" fgColor="#050B2C" level="M" />
          <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'#374151', letterSpacing:1, textAlign:'center' }}>Escanear · PAWID</span>
        </motion.div>
      </div>

      {/* Shine particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div key={i}
          initial={{ opacity:0, scale:0 }}
          animate={{ opacity:[0,1,0], scale:[0,1,0], y:[-20,-80,-140] }}
          transition={{ delay:0.3 + i*0.15, duration:2, repeat:Infinity, repeatDelay:1.5 }}
          style={{ position:'absolute', width:6, height:6, borderRadius:'50%', background:'var(--gold)', left:`${15 + i * 10}%`, bottom:'25%', boxShadow:'0 0 10px var(--gold)' }}
        />
      ))}
    </div>
  )
}

// ─── Frame: FEATURE (generic) ─────────────────────────────────────────────────
function FrameFeature({ emoji, title, subtitle, bullets, accentColor = 'var(--orange)', visual, bgAccent }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', padding:'0 8%' }}>
      {/* Bg accent */}
      {bgAccent && <div style={{ position:'absolute', inset:0, background:bgAccent, pointerEvents:'none' }} />}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center', width:'100%', maxWidth:1100, position:'relative', zIndex:1 }}>
        {/* Visual side */}
        <motion.div {...scaleIn(0.2)} style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'relative' }}>
            {/* Glow */}
            <div style={{ position:'absolute', inset:-40, background:`radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`, borderRadius:'50%', animation:'pulseGlow 3s ease-in-out infinite' }} />
            {/* Main icon */}
            <div style={{ width:180, height:180, borderRadius:'50%', background:`linear-gradient(135deg, ${accentColor}22, ${accentColor}08)`, border:`2px solid ${accentColor}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:80, position:'relative', boxShadow:`0 0 60px ${accentColor}30` }}>
              {emoji}
            </div>
            {/* Visual extra */}
            {visual}
          </div>
        </motion.div>

        {/* Content side */}
        <div>
          <motion.div {...fadeIn(0.3)} style={{ display:'inline-flex', alignItems:'center', gap:6, background:`${accentColor}18`, border:`1px solid ${accentColor}40`, borderRadius:100, padding:'4px 14px', marginBottom:16 }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:10, fontWeight:700, letterSpacing:2, color:accentColor, textTransform:'uppercase' }}>PAWID Feature</span>
          </motion.div>

          <motion.h2 {...fadeUp(0.45)} style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,4vw,52px)', fontWeight:900, letterSpacing:-1, lineHeight:1.05, marginBottom:12 }}>
            {title}
          </motion.h2>

          <motion.p {...fadeIn(0.7)} style={{ fontFamily:'var(--font-body)', fontSize:16, color:'rgba(255,255,255,0.55)', lineHeight:1.65, marginBottom:20 }}>
            {subtitle}
          </motion.p>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {bullets.map((b, i) => (
              <motion.div key={b} {...slideIn(0.85 + i * 0.12, 30)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:`${accentColor}0D`, border:`1px solid ${accentColor}25`, borderRadius:12 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:`${accentColor}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <ChevronRight size={14} color={accentColor} />
                </div>
                <span style={{ fontFamily:'var(--font-sub)', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{b}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Frame: FINALE ────────────────────────────────────────────────────────────
function FrameFinale({ onFinish, pet }) {
  const stats = [
    { value:'12+', label:'Especies' },
    { value:'GPS', label:'Tiempo real' },
    { value:'500+', label:'Cuidadores' },
    { value:'24/7', label:'Dr. Patitas' },
  ]
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:'0 6%', position:'relative' }}>
      {/* Animated fire bg */}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(255,183,3,0.15), rgba(255,107,0,0.12), rgba(255,45,140,0.15), rgba(138,43,226,0.12))', animation:'hologram 6s ease infinite' }} />

      {/* Floating icons */}
      {[{e:'🪪',x:'8%',y:'15%',d:0},{e:'📍',x:'88%',y:'12%',d:0.3},{e:'💉',x:'5%',y:'75%',d:0.6},{e:'🦮',x:'90%',y:'80%',d:0.9},{e:'🗺️',x:'50%',y:'88%',d:1.2},{e:'🩺',x:'15%',y:'45%',d:1.5},{e:'🍗',x:'82%',y:'48%',d:1.8}].map(({ e, x, y, d }) => (
        <motion.span key={e} initial={{ opacity:0, scale:0 }} animate={{ opacity:0.4, scale:1, y:[0,-12,0] }} transition={{ delay:d, duration:3, repeat:Infinity, ease:'easeInOut' }}
          style={{ position:'absolute', fontSize:28, left:x, top:y, filter:'drop-shadow(0 0 10px rgba(255,107,0,0.5))' }}>
          {e}
        </motion.span>
      ))}

      {/* Logo */}
      <motion.img {...scaleIn(0.2)} src="/pawid-logo.png" alt="PAWID"
        style={{ width:160, height:160, objectFit:'contain', borderRadius:'50%', filter:'drop-shadow(0 0 60px rgba(255,107,0,0.7))', marginBottom:24, position:'relative', zIndex:1 }}
      />

      {/* Title */}
      <motion.h1 {...fadeUp(0.6)} style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,5vw,64px)', fontWeight:900, letterSpacing:-2, textAlign:'center', lineHeight:1, marginBottom:8, position:'relative', zIndex:1 }}>
        <span style={{ background:'var(--grad-fire)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>PAWID</span>
        <span style={{ color:'#fff' }}> cuida lo<br />que más quieres</span>
      </motion.h1>

      <motion.p {...fadeIn(1.1)} style={{ fontFamily:'var(--font-body)', fontSize:16, color:'rgba(255,230,199,0.6)', marginBottom:32, textAlign:'center', position:'relative', zIndex:1 }}>
        {pet ? `${pet.name} ya tiene su espacio en el mundo PAWID 🐾` : 'Tu mascota ya tiene su espacio en el mundo PAWID 🐾'}
      </motion.p>

      {/* Stats */}
      <motion.div {...fadeIn(1.3)} style={{ display:'flex', gap:0, marginBottom:40, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, overflow:'hidden', position:'relative', zIndex:1 }}>
        {stats.map(({ value, label }, i) => (
          <div key={label} style={{ padding:'16px 28px', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:26, background:'var(--grad-fire)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{value}</div>
            <div style={{ fontFamily:'var(--font-sub)', fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:1, marginTop:2 }}>{label}</div>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        {...scaleIn(1.7)}
        onClick={onFinish}
        whileHover={{ scale:1.06 }}
        whileTap={{ scale:0.97 }}
        style={{ display:'flex', alignItems:'center', gap:12, padding:'18px 48px', borderRadius:100, background:'var(--grad-fire)', border:'none', color:'#fff', fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, cursor:'pointer', boxShadow:'0 8px 40px rgba(255,107,0,0.5)', letterSpacing:0.5, position:'relative', zIndex:1 }}
      >
        🐾 ¡Empezar ahora! <ChevronRight size={20} strokeWidth={3} />
      </motion.button>

      <motion.p {...fadeIn(2.2)} style={{ fontFamily:'var(--font-body)', fontSize:12, color:'rgba(255,255,255,0.2)', marginTop:16, position:'relative', zIndex:1 }}>
        El portal único para tu mascota · Chile 🇨🇱
      </motion.p>
    </div>
  )
}

// ─── Frame registry ────────────────────────────────────────────────────────────
function renderFrame(id, props) {
  const { pet, user, onFinish } = props
  switch (id) {
    case 'welcome':
      return <FrameWelcome user={user} />

    case 'identity':
      return <FrameIdentity pet={pet} />

    case 'cedula':
      return <FrameFeature
        emoji="🪪" accentColor="#FFB703"
        bgAccent="radial-gradient(ellipse 70% 50% at 30% 50%, rgba(255,183,3,0.08) 0%, transparent 60%)"
        title={<>Cédula<br /><span style={{ background:'var(--grad-fire)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Digital PAWID</span></>}
        subtitle="Tu mascota ahora tiene una identidad oficial reconocida en veterinarias, hoteles, aeropuertos y toda la red PAWID."
        bullets={['QR único escaneable', 'Descargable en alta resolución', 'Perfil público compartible', 'Datos médicos integrados']}
      />

    case 'gps':
      return <FrameFeature
        emoji="📍" accentColor="#3A86FF"
        bgAccent="radial-gradient(ellipse 70% 50% at 70% 50%, rgba(58,134,255,0.08) 0%, transparent 60%)"
        title={<>GPS<br /><span style={{ color:'#3A86FF' }}>Tiempo Real</span></>}
        subtitle="Localiza a tu mascota en cualquier momento desde tu teléfono. Zonas de seguridad configurables con alertas instantáneas."
        bullets={['Rastreo en tiempo real', 'Zonas de seguridad configurables', 'Historial de ubicaciones 7 días', 'Alerta inmediata de escape']}
      />

    case 'medical':
      return <FrameFeature
        emoji="💉" accentColor="#10B981"
        bgAccent="radial-gradient(ellipse 70% 50% at 30% 50%, rgba(16,185,129,0.08) 0%, transparent 60%)"
        title={<>Historial<br /><span style={{ color:'#10B981' }}>Médico</span></>}
        subtitle="Todo el historial de salud de tu mascota en un solo lugar. Nunca más pierdas un control o una vacuna."
        bullets={['Registro de vacunas con alertas', 'Historial de cirugías y consultas', 'Alergias y condiciones conocidas', 'Recordatorios automáticos']}
      />

    case 'cuidadores':
      return <FrameFeature
        emoji="🤝" accentColor="#FF2D8C"
        bgAccent="radial-gradient(ellipse 70% 50% at 70% 50%, rgba(255,45,140,0.08) 0%, transparent 60%)"
        title={<>Red de<br /><span style={{ color:'#FF2D8C' }}>Cuidadores</span></>}
        subtitle="Más de 500 cuidadores verificados listos para cuidar a tu mascota cuando más lo necesitas."
        bullets={['Peluquería y estética', 'Guardería y alojamiento', 'Paseos diarios', 'Veterinarios a domicilio']}
      />

    case 'rutas':
      return <FrameFeature
        emoji="🗺️" accentColor="#F59E0B"
        bgAccent="radial-gradient(ellipse 70% 50% at 30% 50%, rgba(245,158,11,0.08) 0%, transparent 60%)"
        title={<>Rutas<br /><span style={{ color:'#F59E0B' }}>Pet-Friendly</span></>}
        subtitle="Descubre los mejores lugares de Chile para explorar junto a tu mascota. Trekking, playas y restaurantes verificados."
        bullets={['Rutas de trekking por dificultad', 'Playas y parques habilitados', 'Hoteles y restaurantes pet-friendly', 'Guías y reseñas de la comunidad']}
      />

    case 'drpatitas':
      return <FrameFeature
        emoji="🩺" accentColor="#8A2BE2"
        bgAccent="radial-gradient(ellipse 70% 50% at 70% 50%, rgba(138,43,226,0.1) 0%, transparent 60%)"
        title={<>Dr.<br /><span style={{ background:'var(--grad-cosmic)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Patitas</span></>}
        subtitle="Tu veterinario inteligente disponible las 24 horas. Consulta síntomas, dietas, vacunas y emergencias con lenguaje simple."
        bullets={['Respuestas en lenguaje simple', 'Diagnóstico de síntomas comunes', 'Guía de alimentación por especie', 'Alertas de emergencia veterinaria']}
      />

    case 'dieta':
      return <FrameFeature
        emoji="🍗" accentColor="#FF6A00"
        bgAccent="radial-gradient(ellipse 70% 50% at 30% 50%, rgba(255,107,0,0.08) 0%, transparent 60%)"
        title={<>Dieta &<br /><span style={{ color:'#FF6A00' }}>Nutrición</span></>}
        subtitle="Plan nutricional personalizado según la especie, raza, edad y nivel de actividad. Con rutina de ejercicio incluida."
        bullets={['Calculadora de calorías diarias', 'Porciones exactas por comida', 'Lista de alimentos prohibidos', 'Rutina semanal de ejercicio']}
      />

    case 'finale':
      return <FrameFinale onFinish={onFinish} pet={pet} />

    default:
      return null
  }
}

// ─── Background per frame ──────────────────────────────────────────────────────
const FRAME_BG = {
  welcome:    'linear-gradient(160deg, #050B2C 0%, #0d0520 60%, #050B2C 100%)',
  identity:   'linear-gradient(160deg, #0d0520 0%, #1a0a3a 50%, #050B2C 100%)',
  cedula:     'linear-gradient(160deg, #050B2C 0%, #141005 100%)',
  gps:        'linear-gradient(160deg, #020C1B 0%, #050B2C 100%)',
  medical:    'linear-gradient(160deg, #020D08 0%, #050B2C 100%)',
  cuidadores: 'linear-gradient(160deg, #1a0520 0%, #050B2C 100%)',
  rutas:      'linear-gradient(160deg, #0a1205 0%, #050B2C 100%)',
  drpatitas:  'linear-gradient(160deg, #050B2C 0%, #12041f 100%)',
  dieta:      'linear-gradient(160deg, #1a0c05 0%, #050B2C 100%)',
  finale:     '#050B2C',
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WelcomeVideoPage() {
  const navigate = useNavigate()
  const { pets, activePetId } = usePets()
  const { user } = useAuth()
  const pet = pets.find(p => p.id === activePetId) || pets[0]

  const [frameIdx, setFrameIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused,   setPaused]   = useState(false)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const pausedAtRef = useRef(0)

  const currentFrame = FRAMES[frameIdx]
  const isLast = frameIdx === FRAMES.length - 1

  const goToNext = () => {
    if (frameIdx < FRAMES.length - 1) {
      setFrameIdx(i => i + 1)
      setProgress(0)
      startRef.current = null
    }
  }

  const finish = () => {
    localStorage.setItem('pawid_welcomed', '1')
    navigate('/dashboard', { replace: true })
  }

  // Frame timer
  useEffect(() => {
    if (paused || isLast) return
    startRef.current = null
    pausedAtRef.current = 0

    const duration = currentFrame.duration * 1000

    const tick = (now) => {
      if (!startRef.current) startRef.current = now
      const elapsed = now - startRef.current
      const p = Math.min((elapsed / duration) * 100, 100)
      setProgress(p)
      if (p < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        goToNext()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [frameIdx, paused, isLast])

  const handleSkip = () => {
    setFrameIdx(FRAMES.length - 1)
    setProgress(0)
  }

  // Overall progress (for top bar)
  const totalFrames = FRAMES.length
  const segmentW = 100 / totalFrames

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:2000, overflow:'hidden', background:FRAME_BG[currentFrame.id] || '#050B2C', transition:'background 1s ease' }}
      onClick={() => { if (!isLast) goToNext() }}
    >
      {/* Top progress bar — one segment per frame */}
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:10, padding:'12px 16px', display:'flex', gap:4 }}>
        {FRAMES.map((f, i) => (
          <div key={f.id} style={{ flex:1, height:3, borderRadius:2, background:'rgba(255,255,255,0.15)', overflow:'hidden', cursor:'pointer' }}
            onClick={e => { e.stopPropagation(); setFrameIdx(i); setProgress(0) }}
          >
            <motion.div
              style={{ height:'100%', background:'var(--grad-fire)', borderRadius:2 }}
              animate={{ width: i < frameIdx ? '100%' : i === frameIdx ? `${progress}%` : '0%' }}
              transition={{ duration: 0.05 }}
            />
          </div>
        ))}
      </div>

      {/* Skip button */}
      {!isLast && (
        <button onClick={e => { e.stopPropagation(); handleSkip() }}
          style={{ position:'absolute', top:32, right:20, zIndex:10, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:100, padding:'7px 18px', color:'rgba(255,255,255,0.6)', fontFamily:'var(--font-display)', fontSize:12, fontWeight:600, cursor:'pointer', letterSpacing:1, backdropFilter:'blur(12px)', transition:'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >
          Saltar →
        </button>
      )}

      {/* Frame counter */}
      <div style={{ position:'absolute', top:32, left:20, zIndex:10, fontFamily:'var(--font-mono)', fontSize:11, color:'rgba(255,255,255,0.25)', letterSpacing:1 }}>
        {String(frameIdx + 1).padStart(2,'0')} / {String(totalFrames).padStart(2,'0')}
      </div>

      {/* Frame content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentFrame.id}
          initial={{ opacity:0, scale:0.98 }}
          animate={{ opacity:1, scale:1 }}
          exit={{ opacity:0, scale:1.02 }}
          transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
          style={{ position:'absolute', inset:0 }}
          onClick={e => { if (!isLast) { e.stopPropagation(); goToNext() } }}
        >
          {renderFrame(currentFrame.id, { pet, user, onFinish: finish })}
        </motion.div>
      </AnimatePresence>

      {/* Bottom nav hint */}
      {!isLast && (
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}
          style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)', fontFamily:'var(--font-body)', fontSize:11, color:'rgba(255,255,255,0.2)', letterSpacing:2, textTransform:'uppercase', pointerEvents:'none' }}
        >
          Toca para avanzar
        </motion.div>
      )}
    </div>
  )
}
