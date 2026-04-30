import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, MapPin, Navigation2, Droplets, Trees } from 'lucide-react'
import { RUTAS, SITIOS } from '../data/mockData'
import { usePetTheme } from '../hooks/usePetTheme'
import { usePets } from '../context/PetContext'

const DIFF_COLORS = { 'Fácil':'#10B981', 'Moderado':'#F59E0B', 'Difícil':'#EF4444' }
const SITE_TYPE_COLORS = { 'Restaurante':'#EC4899', 'Hotel':'#8A2BE2', 'Playa':'#3A86FF', 'Parque':'#10B981', 'Camping':'#F59E0B' }
const SITE_TYPE_EMOJI = { 'Restaurante':'🍽️', 'Hotel':'🏨', 'Playa':'🏖️', 'Parque':'🌳', 'Camping':'⛺' }

const ROUTE_BG_FALLBACKS = [
  'linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 50%, #1a4a1a 100%)',
  'linear-gradient(135deg, #1a1a3a 0%, #2d2d5a 50%, #1a1a4a 100%)',
  'linear-gradient(135deg, #3a2a1a 0%, #5a4a2a 50%, #4a3a1a 100%)',
  'linear-gradient(135deg, #0a2a3a 0%, #1a4a5a 50%, #0a3a4a 100%)',
  'linear-gradient(135deg, #2a1a3a 0%, #4a2a5a 50%, #3a1a4a 100%)',
  'linear-gradient(135deg, #1a3a2a 0%, #2d5a4d 50%, #1a4a3a 100%)',
]
const ROUTE_EMOJIS = ['🌲', '🏔️', '🌊', '⛰️', '🌿', '🦋']

const TAG_CONFIG = {
  'Pet Water Station': { emoji:'💧', color:'#06B6D4' },
  'Sin correa': { emoji:'🐕', color:'#F59E0B' },
  'Sombra': { emoji:'🌳', color:'#10B981' },
  'Vista panorámica': { emoji:'🏔️', color:'#8B5CF6' },
  'Agua': { emoji:'💧', color:'#06B6D4' },
}

function StarRating({ rating }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
      {Array.from({ length:5 }, (_, i) => (
        <Star key={i} size={11} fill={i < Math.round(rating) ? '#F59E0B' : 'none'} color="#F59E0B" />
      ))}
      <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--color-muted)', marginLeft:2 }}>{rating.toFixed(1)}</span>
    </div>
  )
}

function RutaCard({ r, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  const diffColor = DIFF_COLORS[r.difficulty] || '#9CA3AF'

  return (
    <motion.div
      initial={{ opacity:0, y:24 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      whileHover={{ y:-6 }}
      className="route-card"
      style={{ border:'1px solid rgba(255,255,255,0.1)', position:'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image (or gradient fallback) */}
      <div style={{ height:200, position:'relative', overflow:'hidden' }}>
        {!imgError ? (
          <img src={r.image} alt={r.name}
            style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s', transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ width:'100%', height:'100%', background: ROUTE_BG_FALLBACKS[index % ROUTE_BG_FALLBACKS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:64, opacity:0.3 }}>
            {ROUTE_EMOJIS[index % ROUTE_EMOJIS.length]}
          </div>
        )}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(5,11,44,0.96))' }} />
        {/* Difficulty badge */}
        <div style={{ position:'absolute', top:12, left:12, background:`${diffColor}30`, border:`1px solid ${diffColor}60`, borderRadius:20, padding:'4px 12px', fontFamily:'var(--font-sub)', fontSize:12, fontWeight:600, color:diffColor }}>
          {r.difficulty}
        </div>
        {/* Rating */}
        <div style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', borderRadius:20, padding:'4px 10px' }}>
          <StarRating rating={r.rating} />
        </div>
      </div>

      {/* Info */}
      <div style={{ padding:'16px', background:'rgba(15,10,30,0.9)' }}>
        <h3 style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:17, color:'var(--color-text)', marginBottom:4 }}>{r.name}</h3>
        <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:8 }}>
          <MapPin size={11} style={{ color:'var(--color-muted)', flexShrink:0 }} />
          <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--color-muted)' }}>{r.location}</span>
        </div>
        <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--color-muted)', lineHeight:1.5, marginBottom:10 }}>{r.description}</p>

        {/* Stats row */}
        <div style={{ display:'flex', gap:12, marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <Clock size={12} style={{ color:'var(--color-muted)' }} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--color-text)' }}>{r.duration}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <Navigation2 size={12} style={{ color:'var(--color-muted)' }} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--color-text)' }}>{r.distance}</span>
          </div>
          <div style={{ display:'flex', gap:3 }}>
            {r.species.map(sp => (
              <span key={sp} style={{ fontSize:14 }}>{sp==='dog'?'🐕':sp==='cat'?'🐈':'🐾'}</span>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {r.tags.map(tag => {
            const cfg = TAG_CONFIG[tag] || { emoji:'✅', color:'#10B981' }
            return (
              <span key={tag} style={{ background:`${cfg.color}18`, border:`1px solid ${cfg.color}40`, borderRadius:20, padding:'3px 10px', fontSize:11, color:cfg.color, fontFamily:'var(--font-sub)' }}>
                {cfg.emoji} {tag}
              </span>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

function SitioCard({ s }) {
  const color = SITE_TYPE_COLORS[s.type] || '#7C3AED'
  return (
    <motion.div
      initial={{ opacity:0, scale:0.95 }}
      whileInView={{ opacity:1, scale:1 }}
      viewport={{ once:true }}
      whileHover={{ y:-4, scale:1.01 }}
      className="rounded-2xl overflow-hidden"
      style={{ border:`1px solid rgba(255,255,255,0.08)` }}
    >
      {/* Image */}
      <div style={{ height:160, position:'relative', overflow:'hidden' }}>
        <img src={s.image} alt={s.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 30%, rgba(15,10,30,0.9))' }} />
        <div style={{ position:'absolute', top:10, left:10, background:`${color}30`, border:`1px solid ${color}60`, borderRadius:20, padding:'3px 10px', fontSize:11, fontFamily:'var(--font-sub)', fontWeight:600, color }}>
          {SITE_TYPE_EMOJI[s.type] || '📍'} {s.type}
        </div>
      </div>

      <div style={{ padding:'14px', background:'rgba(15,10,30,0.85)' }}>
        <h4 style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:15, color:'var(--color-text)', marginBottom:3 }}>{s.name}</h4>
        <div style={{ display:'flex', alignItems:'center', gap:3, marginBottom:6 }}>
          <MapPin size={10} style={{ color:'var(--color-muted)' }} />
          <span style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--color-muted)' }}>{s.location}</span>
        </div>
        <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--color-muted)', lineHeight:1.5, marginBottom:8 }}>{s.description}</p>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {s.tags.map(tag => (
            <span key={tag} style={{ background:'rgba(255,255,255,0.06)', borderRadius:20, padding:'2px 8px', fontSize:10, color:'var(--color-muted)', fontFamily:'var(--font-sub)' }}>
              ✅ {tag}
            </span>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
          <div style={{ display:'flex', gap:3 }}>
            {s.species.map(sp => (
              <span key={sp} style={{ fontSize:13 }}>{sp==='dog'?'🐕':sp==='cat'?'🐈':sp==='rabbit'?'🐰':'🐾'}</span>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:2 }}>
            <Star size={10} fill="#F59E0B" color="#F59E0B" />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#F59E0B' }}>{s.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function RutasPage() {
  const { currentTheme } = usePets()
  const theme = usePetTheme(currentTheme)
  const [activeTab, setActiveTab] = useState('rutas')
  const [diffFilter, setDiffFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredRutas = RUTAS.filter(r => diffFilter === 'all' || r.difficulty === diffFilter)
  const filteredSitios = SITIOS.filter(s => typeFilter === 'all' || s.type === typeFilter)

  const siteTypes = [...new Set(SITIOS.map(s => s.type))]

  return (
    <div style={{ minHeight:'100vh', paddingTop:100, paddingBottom:80, background:'var(--color-bg)' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', background:`radial-gradient(ellipse at 50% 20%, ${theme.glow} 0%, transparent 55%)` }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <span className="section-eyebrow">Aventura Juntos</span>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,4vw,52px)', fontWeight:900, letterSpacing:-1, marginBottom:12 }}>
            Rutas &{' '}
            <span style={{ background:'var(--grad-fire)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Panoramas</span>{' '}
            Pet-Friendly
          </h1>
          <p style={{ fontFamily:'var(--font-body)', color:'var(--color-muted)', fontSize:15 }}>
            Chile tiene paisajes increíbles para explorar con tu mascota. Rutas de trekking, playas y sitios pet-friendly verificados.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.1)', marginBottom:28 }}>
          {[{ key:'rutas', label:'🥾 Rutas de Trekking' }, { key:'sitios', label:'📍 Sitios Pet-Friendly' }].map(t => (
            <button key={t.key} className={`tab-btn ${activeTab===t.key ? 'active' : ''}`}
              style={{ fontSize:15, padding:'10px 24px' }}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'rutas' && (
            <motion.div key="rutas" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              {/* Difficulty filter */}
              <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
                {['all', 'Fácil', 'Moderado', 'Difícil'].map(d => (
                  <button key={d} onClick={() => setDiffFilter(d)}
                    style={{
                      padding:'6px 16px', borderRadius:20, cursor:'pointer',
                      border:`1px solid ${diffFilter===d ? (DIFF_COLORS[d]||'var(--pet-primary)') : 'rgba(255,255,255,0.12)'}`,
                      background: diffFilter===d ? `${DIFF_COLORS[d]||'var(--pet-primary)'}20` : 'transparent',
                      color: diffFilter===d ? (DIFF_COLORS[d]||'var(--color-text)') : 'var(--color-muted)',
                      fontFamily:'var(--font-sub)', fontSize:13, fontWeight: diffFilter===d ? 600 : 400,
                    }}>
                    {d === 'all' ? 'Todas' : d}
                  </button>
                ))}
                <span style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--color-muted)', alignSelf:'center', marginLeft:8 }}>
                  {filteredRutas.length} rutas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRutas.map((r, i) => <RutaCard key={r.id} r={r} index={i} />)}
              </div>
            </motion.div>
          )}

          {activeTab === 'sitios' && (
            <motion.div key="sitios" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              {/* Type filter */}
              <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
                <button onClick={() => setTypeFilter('all')}
                  style={{ padding:'6px 16px', borderRadius:20, cursor:'pointer', border:`1px solid ${typeFilter==='all' ? 'var(--pet-primary)' : 'rgba(255,255,255,0.12)'}`, background: typeFilter==='all' ? 'rgba(124,58,237,0.2)' : 'transparent', color:'var(--color-text)', fontFamily:'var(--font-sub)', fontSize:13 }}>
                  Todos
                </button>
                {siteTypes.map(t => {
                  const color = SITE_TYPE_COLORS[t] || '#7C3AED'
                  return (
                    <button key={t} onClick={() => setTypeFilter(t)}
                      style={{ padding:'6px 16px', borderRadius:20, cursor:'pointer', border:`1px solid ${typeFilter===t ? color : 'rgba(255,255,255,0.12)'}`, background: typeFilter===t ? `${color}20` : 'transparent', color: typeFilter===t ? color : 'var(--color-muted)', fontFamily:'var(--font-sub)', fontSize:13 }}>
                      {SITE_TYPE_EMOJI[t] || '📍'} {t}
                    </button>
                  )
                })}
              </div>

              {/* Masonry-like grid */}
              <div style={{ columns:'1', gap:16 }} className="sm:columns-2 lg:columns-3">
                {filteredSitios.map(s => (
                  <div key={s.id} style={{ marginBottom:16, breakInside:'avoid' }}>
                    <SitioCard s={s} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
