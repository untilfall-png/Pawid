import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MapPin, Check, X, Phone, Eye, ChevronDown } from 'lucide-react'
import { CUIDADORES } from '../data/mockData'
import { usePetTheme } from '../hooks/usePetTheme'
import { usePets } from '../context/PetContext'

const SERVICES = [
  { key:'Alojamiento', emoji:'🏠' },
  { key:'Peluquería', emoji:'✂️' },
  { key:'Paseos', emoji:'🏃' },
  { key:'Veterinaria', emoji:'🩺' },
  { key:'Guardería diurna', emoji:'🍽️' },
  { key:'Cuidado nocturno', emoji:'🌙' },
]
const SPECIES_LIST = [
  { key:'dog', label:'Perros', emoji:'🐕' },
  { key:'cat', label:'Gatos', emoji:'🐈' },
  { key:'rabbit', label:'Conejos', emoji:'🐰' },
  { key:'bird', label:'Aves', emoji:'🦜' },
  { key:'reptile', label:'Reptiles', emoji:'🦎' },
  { key:'hamster', label:'Hámsters', emoji:'🐹' },
]
const SERVICE_COLORS = {
  'Alojamiento':'#7C3AED', 'Peluquería':'#EC4899', 'Paseos':'#06B6D4',
  'Veterinaria':'#EF4444', 'Guardería diurna':'#F59E0B', 'Cuidado nocturno':'#8B5CF6',
}

function StarRating({ rating }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
      {Array.from({ length:5 }, (_, i) => (
        <Star key={i} size={12} fill={i < Math.round(rating) ? '#F59E0B' : 'none'} color="#F59E0B" />
      ))}
      <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--color-muted)', marginLeft:4 }}>{rating.toFixed(1)}</span>
    </div>
  )
}

function CuidadorCard({ c, theme }) {
  const [contacted, setContacted] = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity:0, y:24 }}
      animate={{ opacity:1, y:0 }}
      whileHover={{ y:-4 }}
      className="glass rounded-2xl overflow-hidden"
      style={{
        border: hovered ? 'rgba(255,107,0,0.3)' : '1px solid rgba(255,255,255,0.08)',
        borderColor: hovered ? 'rgba(255,107,0,0.25)' : 'rgba(255,255,255,0.08)',
        borderWidth:1, borderStyle:'solid',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
        transition:'border-color 0.3s, box-shadow 0.3s',
        position:'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top fire accent bar */}
      <div style={{ height:3, background:'var(--grad-fire)', transform: hovered ? 'scaleX(1)' : 'scaleX(0)', transformOrigin:'left', transition:'transform 0.35s' }} />
      {/* Avatar header */}
      <div style={{
        background:`linear-gradient(135deg, ${SERVICE_COLORS[c.services[0]] || theme.primary}30, transparent)`,
        padding:'20px 20px 12px',
        display:'flex', gap:14, alignItems:'flex-start',
      }}>
        <img
          src={c.avatar}
          alt={c.name}
          style={{ width:64, height:64, borderRadius:'50%', border:`2px solid ${SERVICE_COLORS[c.services[0]] || theme.primary}`, flexShrink:0 }}
          onError={e => { e.target.style.display='none' }}
        />
        <div className="flex-1 min-w-0">
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <h3 style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:16, color:'var(--color-text)' }}>{c.name}</h3>
            {c.badge && (
              <span style={{ background:`${SERVICE_COLORS[c.services[0]] || theme.primary}25`, border:`1px solid ${SERVICE_COLORS[c.services[0]] || theme.primary}50`, borderRadius:20, padding:'2px 8px', fontSize:10, color:'var(--color-text)', flexShrink:0 }}>
                ✨ {c.badge}
              </span>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:3 }}>
            <MapPin size={11} style={{ color:'var(--color-muted)' }} />
            <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--color-muted)' }}>{c.location}</span>
          </div>
          <div style={{ marginTop:4 }}>
            <StarRating rating={c.rating} />
            <span style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--color-muted)', marginLeft:2 }}>({c.reviews} reseñas)</span>
          </div>
        </div>
        {/* Available badge */}
        <div style={{
          background: c.available ? 'rgba(16,185,129,0.2)' : 'rgba(156,163,175,0.15)',
          border: `1px solid ${c.available ? 'rgba(16,185,129,0.4)' : 'rgba(156,163,175,0.3)'}`,
          borderRadius:20, padding:'3px 10px', fontSize:11,
          color: c.available ? '#6EE7B7' : '#9CA3AF',
          flexShrink:0,
        }}>
          {c.available ? '● Disponible' : '○ Ocupado'}
        </div>
      </div>

      <div style={{ padding:'0 20px 16px' }}>
        {/* Bio */}
        <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--color-muted)', lineHeight:1.5, marginBottom:12 }}>
          {c.bio}
        </p>

        {/* Services */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          {c.services.map(s => (
            <span key={s} style={{
              background:`${SERVICE_COLORS[s] || theme.primary}20`,
              border:`1px solid ${SERVICE_COLORS[s] || theme.primary}40`,
              borderRadius:20, padding:'3px 10px', fontSize:11,
              color:`${SERVICE_COLORS[s] || theme.primary}`,
            }}>
              {SERVICES.find(sv => sv.key === s)?.emoji || ''} {s}
            </span>
          ))}
        </div>

        {/* Species */}
        <div style={{ display:'flex', gap:4, marginBottom:14 }}>
          {c.species.map(sp => (
            <span key={sp} style={{ fontSize:16 }} title={SPECIES_LIST.find(s => s.key === sp)?.label}>
              {SPECIES_LIST.find(s => s.key === sp)?.emoji || '🐾'}
            </span>
          ))}
        </div>

        {/* Price + actions */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, color:'var(--color-text)' }}>
              ${c.price.toLocaleString('es-CL')}
            </span>
            <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--color-muted)' }}> / {c.priceUnit}</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button
              className="btn-ghost btn-sm"
              style={{ padding:'8px 14px' }}
              onClick={() => alert(`Perfil de ${c.name} — próximamente disponible`)}
            >
              <Eye size={13} /> Ver perfil
            </button>
            <button
              className="btn-primary btn-sm"
              disabled={!c.available || contacted}
              style={{ opacity: (!c.available || contacted) ? 0.6 : 1, padding:'8px 14px' }}
              onClick={() => setContacted(true)}
            >
              {contacted ? <><Check size={13} /> Contactado</> : <><Phone size={13} /> Contactar</>}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function CuidadoresPage() {
  const { currentTheme } = usePets()
  const theme = usePetTheme(currentTheme)

  const [activeServices, setActiveServices] = useState([])
  const [activeSpecies, setActiveSpecies] = useState([])
  const [maxPrice, setMaxPrice] = useState(40000)
  const [minRating, setMinRating] = useState(0)
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const toggleService = (key) =>
    setActiveServices(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  const toggleSpecies = (key) =>
    setActiveSpecies(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  const filtered = useMemo(() => CUIDADORES.filter(c => {
    if (activeServices.length && !c.services.some(s => activeServices.includes(s))) return false
    if (activeSpecies.length && !c.species.some(s => activeSpecies.includes(s))) return false
    if (c.price > maxPrice) return false
    if (c.rating < minRating) return false
    if (onlyAvailable && !c.available) return false
    return true
  }), [activeServices, activeSpecies, maxPrice, minRating, onlyAvailable])

  return (
    <div style={{ minHeight:'100vh', paddingTop:100, paddingBottom:80, background:'var(--color-bg)' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', background:`radial-gradient(ellipse at 60% 20%, ${theme.glow} 0%, transparent 55%)` }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} className="mb-10">
          <span className="section-eyebrow">Red de Cuidadores</span>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,4vw,52px)', fontWeight:900, letterSpacing:-1, marginBottom:12 }}>
            Tu mascota en las{' '}
            <span style={{ background:'var(--grad-fire)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>mejores manos</span>
          </h1>
          <p style={{ fontFamily:'var(--font-body)', color:'var(--color-muted)', fontSize:15 }}>
            {CUIDADORES.length} cuidadores verificados · {CUIDADORES.filter(c => c.available).length} disponibles ahora
          </p>
        </motion.div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* ── FILTERS SIDEBAR ── */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="glass-dark rounded-2xl p-5 sticky top-20 space-y-5">
              <h3 style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:15, color:'var(--color-text)' }}>Filtros</h3>

              {/* Service filter */}
              <div>
                <p style={{ fontFamily:'var(--font-sub)', fontSize:12, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Servicio</p>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {SERVICES.map(s => (
                    <button key={s.key} onClick={() => toggleService(s.key)}
                      style={{
                        display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
                        borderRadius:10, border:`1px solid ${activeServices.includes(s.key) ? SERVICE_COLORS[s.key] : 'rgba(255,255,255,0.1)'}`,
                        background: activeServices.includes(s.key) ? `${SERVICE_COLORS[s.key]}20` : 'transparent',
                        color:'var(--color-text)', fontFamily:'var(--font-sub)', fontSize:13, cursor:'pointer',
                      }}>
                      {activeServices.includes(s.key) && <Check size={12} color={SERVICE_COLORS[s.key]} />}
                      <span>{s.emoji} {s.key}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Species filter */}
              <div>
                <p style={{ fontFamily:'var(--font-sub)', fontSize:12, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Especie</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {SPECIES_LIST.map(s => (
                    <button key={s.key} onClick={() => toggleSpecies(s.key)}
                      style={{
                        padding:'6px 10px', borderRadius:10,
                        border:`1px solid ${activeSpecies.includes(s.key) ? theme.primary : 'rgba(255,255,255,0.1)'}`,
                        background: activeSpecies.includes(s.key) ? `${theme.primary}20` : 'transparent',
                        color:'var(--color-text)', fontFamily:'var(--font-sub)', fontSize:12, cursor:'pointer',
                      }}>
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p style={{ fontFamily:'var(--font-sub)', fontSize:12, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
                  Precio máx: <strong style={{ color:'var(--color-text)' }}>${maxPrice.toLocaleString('es-CL')}</strong>
                </p>
                <input type="range" min={5000} max={40000} step={1000} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)}
                  style={{ width:'100%', accentColor: theme.primary }} />
              </div>

              {/* Rating */}
              <div>
                <p style={{ fontFamily:'var(--font-sub)', fontSize:12, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
                  Calificación mínima
                </p>
                <div style={{ display:'flex', gap:6 }}>
                  {[0,4,4.5,4.8].map(r => (
                    <button key={r} onClick={() => setMinRating(r)}
                      style={{
                        padding:'4px 10px', borderRadius:20, cursor:'pointer',
                        border:`1px solid ${minRating===r ? '#F59E0B' : 'rgba(255,255,255,0.1)'}`,
                        background: minRating===r ? 'rgba(245,158,11,0.2)' : 'transparent',
                        color:'var(--color-text)', fontFamily:'var(--font-sub)', fontSize:12,
                      }}>
                      {r === 0 ? 'Todos' : `${r}★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available only */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:'var(--font-sub)', fontSize:13, color:'var(--color-text)' }}>Solo disponibles</span>
                <button onClick={() => setOnlyAvailable(v => !v)}
                  style={{ width:44, height:24, borderRadius:12, background: onlyAvailable ? theme.primary : 'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                  <span style={{ position:'absolute', top:3, left: onlyAvailable ? 22 : 3, width:18, height:18, borderRadius:'50%', background:'white', transition:'left 0.2s' }} />
                </button>
              </div>

              {/* Reset */}
              {(activeServices.length || activeSpecies.length || onlyAvailable || minRating > 0) > 0 && (
                <button onClick={() => { setActiveServices([]); setActiveSpecies([]); setOnlyAvailable(false); setMinRating(0) }}
                  style={{ width:'100%', padding:'8px', borderRadius:10, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.1)', color:'#FCA5A5', fontFamily:'var(--font-sub)', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <X size={13} /> Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* ── GRID ── */}
          <div className="flex-1">
            <div style={{ marginBottom:12, fontFamily:'var(--font-sub)', fontSize:14, color:'var(--color-muted)' }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </div>
            <AnimatePresence>
              {filtered.length === 0
                ? (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass-dark rounded-2xl p-12 text-center">
                    <p style={{ fontSize:48 }}>🔍</p>
                    <p style={{ fontFamily:'var(--font-sub)', fontSize:16, color:'var(--color-muted)', marginTop:12 }}>Sin resultados con estos filtros.</p>
                  </motion.div>
                )
                : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {filtered.map((c, i) => (
                      <motion.div key={c.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.06 }}>
                        <CuidadorCard c={c} theme={theme} />
                      </motion.div>
                    ))}
                  </div>
                )
              }
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
