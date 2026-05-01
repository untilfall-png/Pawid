import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  PawPrint, CreditCard, MapPin, Activity, Apple, Users, Map as MapIcon,
  Stethoscope, Plus, TrendingUp, ChevronLeft, Menu, Video,
  Shield, Syringe, Scissors, Cpu, AlertCircle,
} from 'lucide-react'
import { usePets } from '../context/PetContext'
import { usePetTheme } from '../hooks/usePetTheme'
import { PetIDCard } from './CedulaPage'
import DietaPage from './DietaPage'
import VetChatPage from './VetChatPage'
import CuidadoresPage from './CuidadoresPage'
import RutasPage from './RutasPage'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SPECIES_EMOJI = { dog:'🐕', cat:'🐈', rabbit:'🐰', bird:'🦜', reptile:'🦎', fish:'🐠', hamster:'🐹', other:'🐾' }

const TABS = [
  { key:'inicio',      label:'Mi Mascota',       icon:PawPrint,     emoji:'🐾' },
  { key:'cedula',      label:'Cédula PAWID',      icon:CreditCard,   emoji:'🪪' },
  { key:'medico',      label:'Historial Médico',  icon:Activity,     emoji:'🏥' },
  { key:'gps',         label:'GPS & Ubicación',   icon:MapPin,       emoji:'📍' },
  { key:'dieta',       label:'Dieta & Nutrición', icon:Apple,        emoji:'🍗' },
  { key:'cuidadores',  label:'Cuidadores',        icon:Users,        emoji:'🤝' },
  { key:'rutas',       label:'Rutas',             icon:MapIcon,      emoji:'🗺️' },
  { key:'veterinario', label:'Dr. Patitas',       icon:Stethoscope,  emoji:'🩺' },
]

const pawIcon = new L.DivIcon({
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 0 8px rgba(124,58,237,0.8))">🐾</div>`,
  iconSize: [32, 32], iconAnchor: [16, 32], className: '',
})

function generateWeightHistory(currentWeight, count = 6) {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now)
    date.setMonth(date.getMonth() - (count - 1 - i))
    const variance = (Math.random() - 0.5) * (currentWeight * 0.08)
    return {
      month: date.toLocaleString('es-CL', { month: 'short' }),
      peso: parseFloat(Math.max(0.1, currentWeight + variance * (i / count)).toFixed(1)),
    }
  })
}

// ─── GPS Widget ────────────────────────────────────────────────────────────────
function GPSWidget({ theme }) {
  const [mapReady, setMapReady] = useState(false)
  const center = [-33.4489, -70.6693]
  useEffect(() => { const t = setTimeout(() => setMapReady(true), 300); return () => clearTimeout(t) }, [])

  return (
    <div className="glass-dark rounded-2xl overflow-hidden">
      <div style={{ height: 280, position: 'relative' }}>
        {mapReady && (
          <MapContainer center={center} zoom={14} style={{ height:'100%', width:'100%' }} zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <Marker position={center} icon={pawIcon}><Popup>📍 Última ubicación conocida</Popup></Marker>
          </MapContainer>
        )}
        <div style={{ position:'absolute', top:12, left:12, zIndex:1000, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', borderRadius:12, padding:'8px 14px', border:'1px solid rgba(16,185,129,0.4)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#10B981', boxShadow:'0 0 8px #10B981', animation:'pulse 2s infinite' }} />
            <span style={{ fontFamily:'var(--font-sub)', fontSize:12, color:'#6EE7B7', fontWeight:600 }}>En zona segura ✅</span>
          </div>
        </div>
      </div>
      <div style={{ padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <p style={{ fontFamily:'var(--font-sub)', fontWeight:600, fontSize:14, color:'var(--color-text)' }}>📍 Última ubicación: hace 3 min</p>
            <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--color-muted)', marginTop:2 }}>Av. Providencia 1234, Santiago</p>
          </div>
          <div style={{ background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:10, padding:'6px 12px', fontFamily:'var(--font-sub)', fontSize:11, color:'#FCD34D', textAlign:'center' }}>
            <div style={{ fontSize:16 }}>📡</div>
            <div>GPS Tracker™</div>
            <div style={{ fontSize:10, opacity:0.7 }}>Disponible</div>
          </div>
        </div>
        <p style={{ fontFamily:'var(--font-body)', fontSize:11, color:'rgba(245,158,11,0.7)', marginTop:8, fontStyle:'italic' }}>
          GPS en tiempo real disponible con dispositivo PAWID Tracker™
        </p>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.5)}}`}</style>
    </div>
  )
}

// ─── Health Cards ──────────────────────────────────────────────────────────────
function HealthCards({ pet, theme }) {
  const nextVax = (pet.vaccines || [])
    .filter(v => v.nextDate && new Date(v.nextDate) > new Date())
    .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate))[0]
  const activeConditions = (pet.conditions || []).filter(c => c.status === 'activa').length

  const cards = [
    { icon:'💉', label:'Próxima vacuna', value: nextVax ? nextVax.name : 'Sin pendientes', sub: nextVax ? nextVax.nextDate : '✅ Al día', color: nextVax ? '#F59E0B' : '#10B981' },
    { icon:'⚖️', label:'Peso actual', value: pet.weight ? `${pet.weight} kg` : '—', sub:'Última actualización: hoy', color: theme.primary },
    { icon:'🏥', label:'Condiciones activas', value: activeConditions || 'Ninguna', sub: activeConditions > 0 ? `${activeConditions} bajo seguimiento` : '✅ Sin condiciones', color: activeConditions > 0 ? '#EF4444' : '#10B981' },
    { icon:'⚠️', label:'Alergias', value: (pet.allergies || []).length || 'Ninguna', sub: (pet.allergies || []).slice(0, 2).join(', ') || 'Sin alergias registradas', color: (pet.allergies || []).length > 0 ? '#F59E0B' : '#10B981' },
  ]

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:12 }}>
      {cards.map(({ icon, label, value, sub, color }) => (
        <motion.div key={label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          className="glass rounded-2xl p-4" style={{ border:`1px solid ${color}30` }}>
          <div style={{ fontSize:24, marginBottom:6 }}>{icon}</div>
          <p style={{ fontFamily:'var(--font-sub)', fontSize:11, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:1 }}>{label}</p>
          <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, color, marginTop:2 }}>{value}</p>
          <p style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--color-muted)', marginTop:2 }}>{sub}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Weight Chart ──────────────────────────────────────────────────────────────
function WeightChart({ pet, theme }) {
  const data = generateWeightHistory(pet.weight || 5)
  return (
    <div className="glass-dark rounded-2xl p-5">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h4 style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:15, color:'var(--color-text)', display:'flex', alignItems:'center', gap:8 }}>
          <TrendingUp size={16} style={{ color:theme.primary }} /> Evolución de peso
        </h4>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--color-muted)' }}>Últimos 6 meses</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top:4, right:4, bottom:0, left:-20 }}>
          <defs>
            <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.primary} stopOpacity={0.4} />
              <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" tick={{ fontFamily:'var(--font-mono)', fontSize:10, fill:'rgba(250,250,250,0.5)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontFamily:'var(--font-mono)', fontSize:10, fill:'rgba(250,250,250,0.5)' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background:'rgba(15,10,30,0.9)', border:`1px solid ${theme.primary}40`, borderRadius:10, fontFamily:'var(--font-sub)', fontSize:12, color:'white' }} formatter={v => [`${v} kg`, 'Peso']} />
          <Area type="monotone" dataKey="peso" stroke={theme.primary} strokeWidth={2} fill="url(#wGrad)" dot={{ fill:theme.primary, r:3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Pet Ficha ─────────────────────────────────────────────────────────────────
function PetFicha({ pet, theme, onTabChange }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="glass-dark rounded-2xl p-6"
        style={{ display:'flex', gap:20, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{
          width:88, height:88, borderRadius:'50%', flexShrink:0,
          background: pet.photo ? `url(${pet.photo}) center/cover no-repeat` : `${theme.primary}30`,
          border:`3px solid ${theme.primary}`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:40,
          boxShadow:`0 0 24px ${theme.glow}`,
        }}>
          {!pet.photo && (SPECIES_EMOJI[pet.species] || '🐾')}
        </div>
        <div style={{ flex:1, minWidth:180 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:30, color:'var(--color-text)', marginBottom:4 }}>{pet.name}</h2>
          <p style={{ fontFamily:'var(--font-sub)', fontSize:14, color:'var(--color-muted)' }}>
            {[pet.breed, pet.sex, pet.weight ? `${pet.weight} kg` : null].filter(Boolean).join(' · ')}
          </p>
          <div style={{ marginTop:10, fontFamily:'var(--font-mono)', fontSize:12, color:theme.primary, background:`${theme.primary}18`, padding:'4px 12px', borderRadius:8, display:'inline-block' }}>
            {pet.pawid}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button className="btn-primary btn-sm" onClick={() => onTabChange('cedula')}>
            <CreditCard size={14} /> Ver cédula
          </button>
          <button className="btn-ghost btn-sm" onClick={() => onTabChange('medico')}>
            <Activity size={14} /> Historial
          </button>
        </div>
      </motion.div>

      <HealthCards pet={pet} theme={theme} />
      <WeightChart pet={pet} theme={theme} />
    </div>
  )
}

// ─── Cedula Panel ──────────────────────────────────────────────────────────────
function CedulaPanel({ pet, theme, navigate }) {
  const [side, setSide] = useState('front')
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, alignItems:'center' }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        style={{ width:'100%', maxWidth:520 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--color-text)' }}>🪪 Cédula PAWID</h2>
          <div style={{ display:'flex', gap:8 }}>
            {['front', 'back'].map(s => (
              <button key={s} onClick={() => setSide(s)}
                style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontFamily:'var(--font-sub)', fontWeight:600, cursor:'pointer', border:`1px solid ${side===s ? theme.primary : 'rgba(255,255,255,0.15)'}`, background: side===s ? `${theme.primary}25` : 'transparent', color: side===s ? theme.primary : 'var(--color-muted)' }}>
                {s === 'front' ? 'Frente' : 'Dorso'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width:'100%', aspectRatio:'1.586/1', borderRadius:20, overflow:'hidden', boxShadow:`0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${theme.glow}` }}>
          <PetIDCard pet={pet} theme={theme} side={side} />
        </div>

        <div style={{ display:'flex', gap:10, marginTop:16, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn-primary btn-sm" onClick={() => navigate('/cedula')}>
            <Shield size={14} /> Ver cédula completa
          </button>
          <button className="btn-ghost btn-sm" onClick={() => window.open(`/perfil/${pet.pawid}`, '_blank')}>
            <MapPin size={14} /> Perfil público
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
        className="glass-dark rounded-2xl p-5"
        style={{ width:'100%', maxWidth:520 }}>
        <h4 style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:14, color:'var(--color-text)', marginBottom:12 }}>Información del chip y estado</h4>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
          {[
            { icon:Cpu, label:'Microchip', value: pet.hasMicrochip ? '✅ Registrado' : 'No registrado', color: pet.hasMicrochip ? '#10B981' : 'var(--color-muted)' },
            { icon:Scissors, label:'Esterilizado', value: pet.sterilized ? '✅ Sí' : 'No', color: pet.sterilized ? '#10B981' : 'var(--color-muted)' },
            { icon:Syringe, label:'Vacunas', value:`${(pet.vaccines||[]).length} registro${(pet.vaccines||[]).length!==1?'s':''}`, color:'#3B82F6' },
          ].map(({ icon:Icon, label, value, color }) => (
            <div key={label} className="glass rounded-xl p-3 text-center">
              <Icon size={18} style={{ color, margin:'0 auto 6px' }} />
              <p style={{ fontFamily:'var(--font-sub)', fontSize:10, color:'var(--color-muted)', marginBottom:4 }}>{label}</p>
              <p style={{ fontFamily:'var(--font-sub)', fontWeight:600, fontSize:12, color }}>{value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Medical History Panel ─────────────────────────────────────────────────────
function MedicoPanel({ pet, theme }) {
  const [activeTab, setActiveTab] = useState('vacunas')

  const medTabs = [
    { key:'vacunas', label:'💉 Vacunas', count:(pet.vaccines||[]).length },
    { key:'condiciones', label:'🏥 Condiciones', count:(pet.conditions||[]).length },
    { key:'alergias', label:'⚠️ Alergias', count:(pet.allergies||[]).length },
    { key:'procedimientos', label:'✂️ Procedimientos', count:(pet.procedures||[]).length },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <HealthCards pet={pet} theme={theme} />

      <div className="glass-dark rounded-2xl overflow-hidden">
        <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.08)', overflowX:'auto' }}>
          {medTabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                padding:'12px 16px', border:'none', cursor:'pointer', whiteSpace:'nowrap',
                background: activeTab===t.key ? `${theme.primary}20` : 'transparent',
                color: activeTab===t.key ? 'var(--color-text)' : 'var(--color-muted)',
                fontFamily:'var(--font-sub)', fontSize:13, fontWeight: activeTab===t.key ? 600 : 400,
                borderBottom: activeTab===t.key ? `2px solid ${theme.primary}` : '2px solid transparent',
                transition:'all 0.2s',
              }}>
              {t.label}
              {t.count > 0 && (
                <span style={{ marginLeft:6, background:`${theme.primary}30`, borderRadius:20, padding:'1px 7px', fontSize:10, color:theme.primary }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding:20 }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              {activeTab === 'vacunas' && (
                (pet.vaccines||[]).length === 0
                  ? <EmptyState icon="💉" text="No hay vacunas registradas." />
                  : (pet.vaccines||[]).map(v => (
                      <VaccineRow key={v.id} v={v} theme={theme} />
                    ))
              )}
              {activeTab === 'condiciones' && (
                (pet.conditions||[]).length === 0
                  ? <EmptyState icon="🏥" text="No hay condiciones registradas." />
                  : (pet.conditions||[]).map(c => (
                      <div key={c.id} className="glass rounded-xl p-4 mb-3" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                        <div>
                          <p style={{ fontFamily:'var(--font-sub)', fontWeight:600, fontSize:15, color:'var(--color-text)' }}>{c.name}</p>
                          {c.notes && <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--color-muted)', marginTop:2 }}>{c.notes}</p>}
                        </div>
                        <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, fontFamily:'var(--font-sub)', fontWeight:600, background: c.status==='activa' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: c.status==='activa' ? '#FCA5A5' : '#6EE7B7', border:`1px solid ${c.status==='activa' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}` }}>
                          {c.status}
                        </span>
                      </div>
                    ))
              )}
              {activeTab === 'alergias' && (
                (pet.allergies||[]).length === 0
                  ? <EmptyState icon="⚠️" text="No hay alergias registradas." />
                  : <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {(pet.allergies||[]).map((a, i) => (
                        <span key={i} style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.35)', borderRadius:20, padding:'6px 16px', fontSize:13, color:'#FCA5A5', fontFamily:'var(--font-sub)', fontWeight:600 }}>
                          ⚠️ {a}
                        </span>
                      ))}
                    </div>
              )}
              {activeTab === 'procedimientos' && (
                (pet.procedures||[]).length === 0
                  ? <EmptyState icon="✂️" text="No hay procedimientos registrados." />
                  : (pet.procedures||[]).map(p => (
                      <div key={p.id} className="glass rounded-xl p-4 mb-3">
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
                          <div>
                            <p style={{ fontFamily:'var(--font-sub)', fontWeight:600, fontSize:15, color:'var(--color-text)' }}>✂️ {p.name}</p>
                            {p.vet && <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--color-muted)', marginTop:2 }}>{p.vet}</p>}
                          </div>
                          {p.date && <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:theme.primary, background:`${theme.primary}18`, padding:'4px 10px', borderRadius:8 }}>{p.date}</span>}
                        </div>
                        {p.notes && <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--color-muted)', marginTop:8 }}>{p.notes}</p>}
                      </div>
                    ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function VaccineRow({ v, theme }) {
  const now = new Date()
  const next = v.nextDate ? new Date(v.nextDate) : null
  const daysUntil = next ? Math.ceil((next - now) / (1000*60*60*24)) : null
  const status = !next ? 'sin-fecha' : daysUntil < 0 ? 'vencida' : daysUntil < 30 ? 'pronto' : 'al-dia'
  const statusColors = { 'al-dia':['#10B981','rgba(16,185,129,0.2)'], 'pronto':['#F59E0B','rgba(245,158,11,0.2)'], 'vencida':['#EF4444','rgba(239,68,68,0.2)'], 'sin-fecha':['var(--color-muted)','rgba(255,255,255,0.06)'] }
  const [color, bg] = statusColors[status]

  return (
    <div className="glass rounded-xl p-4 mb-3" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8, borderLeft:`3px solid ${color}` }}>
      <div>
        <p style={{ fontFamily:'var(--font-sub)', fontWeight:600, fontSize:15, color:'var(--color-text)' }}>💉 {v.name}</p>
        <div style={{ display:'flex', gap:12, marginTop:4 }}>
          {v.date && <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--color-muted)' }}>Aplicada: {v.date}</span>}
          {v.vet && <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--color-muted)' }}>· {v.vet}</span>}
        </div>
      </div>
      {v.nextDate && (
        <span style={{ fontFamily:'var(--font-sub)', fontSize:12, fontWeight:600, background:bg, border:`1px solid ${color}40`, color, borderRadius:20, padding:'4px 12px' }}>
          {status === 'vencida' ? '❌ Vencida' : status === 'pronto' ? `⚠️ En ${daysUntil}d` : `✅ ${v.nextDate}`}
        </span>
      )}
    </div>
  )
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign:'center', padding:'32px 0' }}>
      <p style={{ fontSize:40, marginBottom:12 }}>{icon}</p>
      <p style={{ fontFamily:'var(--font-body)', color:'var(--color-muted)', fontSize:14 }}>{text}</p>
    </div>
  )
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { pets, activePetId, setActivePetId } = usePets()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('inicio')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const pet = pets.find(p => p.id === activePetId) || pets[0]
  const theme = usePetTheme(pet?.species)

  useEffect(() => { if (pet?.species) theme.apply() }, [pet?.species])

  if (!pet) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
        <span style={{ fontSize:64 }}>🐾</span>
        <p style={{ fontFamily:'var(--font-sub)', fontSize:18, color:'var(--color-muted)' }}>No tienes mascotas registradas.</p>
        <button className="btn-primary" onClick={() => navigate('/crear')}>
          <Plus size={16} /> Crear mi primera mascota
        </button>
      </div>
    )
  }

  const MOBILE_TABS = TABS.slice(0, 6)

  return (
    <div style={{ minHeight:'100vh', background:'var(--color-bg)', paddingTop:64 }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', background:`radial-gradient(ellipse at 20% 30%, ${theme.glow} 0%, transparent 50%)` }} />

      <div style={{ display:'flex', position:'relative', zIndex:10, height:'calc(100vh - 64px)' }}>

        {/* ── SIDEBAR (desktop) ── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width:0, opacity:0 }}
              animate={{ width:248, opacity:1 }}
              exit={{ width:0, opacity:0 }}
              transition={{ duration:0.3 }}
              style={{ flexShrink:0, overflow:'hidden', height:'100%' }}
            >
              <div style={{
                width:248, height:'100%', display:'flex', flexDirection:'column',
                background:'rgba(5,11,44,0.8)', backdropFilter:'blur(20px)',
                borderRight:'1px solid rgba(255,255,255,0.06)',
              }}>
                {/* Pet selector */}
                <div style={{ padding:'16px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontFamily:'var(--font-sub)', fontSize:10, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:10 }}>Mis mascotas</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {pets.map(p => (
                      <button key={p.id} onClick={() => setActivePetId(p.id)}
                        style={{
                          display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:12, border:'none', cursor:'pointer',
                          background: p.id === pet.id ? `${theme.primary}25` : 'transparent',
                          color:'var(--color-text)', fontFamily:'var(--font-sub)', fontSize:13,
                          transition:'background 0.2s',
                          boxShadow: p.id === pet.id ? `inset 3px 0 0 ${theme.primary}` : 'none',
                        }}>
                        <div style={{
                          width:30, height:30, borderRadius:'50%', flexShrink:0,
                          background: p.photo ? `url(${p.photo}) center/cover` : `${theme.primary}40`,
                          border: p.id === pet.id ? `2px solid ${theme.primary}` : '2px solid transparent',
                          display:'flex', alignItems:'center', justifyContent:'center', fontSize:15,
                        }}>
                          {!p.photo && (SPECIES_EMOJI[p.species] || '🐾')}
                        </div>
                        <span style={{ flex:1, textAlign:'left', fontWeight: p.id===pet.id ? 600 : 400 }}>{p.name}</span>
                        {p.id === pet.id && <div style={{ width:6, height:6, borderRadius:'50%', background:theme.primary }} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex:1, overflowY:'auto', padding:'10px 8px' }}>
                  {TABS.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.key
                    return (
                      <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        style={{
                          width:'100%', display:'flex', alignItems:'center', gap:10,
                          padding:'10px 12px', borderRadius:12, border:'none', cursor:'pointer', marginBottom:2,
                          background: isActive ? `${theme.primary}22` : 'transparent',
                          color: isActive ? 'var(--color-text)' : 'var(--color-muted)',
                          fontFamily:'var(--font-sub)', fontSize:13, fontWeight: isActive ? 600 : 400,
                          transition:'all 0.2s', textAlign:'left',
                          boxShadow: isActive ? `inset 3px 0 0 ${theme.primary}` : 'none',
                        }}>
                        <span style={{ fontSize:16, flexShrink:0 }}>{tab.emoji}</span>
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>

                {/* Bottom actions */}
                <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', gap:6 }}>
                  <button onClick={() => navigate('/bienvenida')}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:12, border:'1px solid rgba(255,183,3,0.25)', background:'rgba(255,183,3,0.08)', color:'#FCD34D', fontFamily:'var(--font-sub)', fontSize:12, cursor:'pointer', transition:'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,183,3,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(255,183,3,0.08)'}>
                    <Video size={14} /> Ver presentación PAWID
                  </button>
                  <button onClick={() => navigate('/crear')}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:12, border:'1px dashed rgba(255,255,255,0.15)', background:'transparent', color:'var(--color-muted)', fontFamily:'var(--font-sub)', fontSize:12, cursor:'pointer', transition:'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}>
                    <Plus size={14} /> Nueva mascota
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex:1, minWidth:0, overflowY:'auto', padding:'20px 24px 80px', display:'flex', flexDirection:'column', gap:0 }}>
          {/* Toggle sidebar */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <button onClick={() => setSidebarOpen(s => !s)}
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'7px 12px', cursor:'pointer', color:'var(--color-text)', display:'flex', alignItems:'center', gap:6, fontFamily:'var(--font-sub)', fontSize:12, transition:'all 0.2s', flexShrink:0 }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
              {sidebarOpen ? <ChevronLeft size={14} /> : <Menu size={14} />}
              {sidebarOpen ? 'Cerrar' : 'Menú'}
            </button>

            {/* Mobile tabs (horizontal scroll) */}
            <div className="md:hidden" style={{ display:'flex', gap:6, overflowX:'auto', flex:1, paddingBottom:2 }}>
              {MOBILE_TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding:'6px 12px', borderRadius:20, border:`1px solid ${activeTab===tab.key ? theme.primary : 'rgba(255,255,255,0.12)'}`,
                    background: activeTab===tab.key ? `${theme.primary}20` : 'transparent',
                    color: activeTab===tab.key ? 'var(--color-text)' : 'var(--color-muted)',
                    fontFamily:'var(--font-sub)', fontSize:12, cursor:'pointer', whiteSpace:'nowrap',
                    transition:'all 0.2s', flexShrink:0,
                  }}>
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>

            {/* Breadcrumb on desktop */}
            <div className="hidden md:flex" style={{ alignItems:'center', gap:8, color:'var(--color-muted)', fontFamily:'var(--font-sub)', fontSize:13 }}>
              <span style={{ fontSize:16 }}>{TABS.find(t => t.key===activeTab)?.emoji}</span>
              <span>{TABS.find(t => t.key===activeTab)?.label}</span>
            </div>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }} transition={{ duration:0.2 }}>
              {activeTab === 'inicio'      && <PetFicha pet={pet} theme={theme} onTabChange={setActiveTab} />}
              {activeTab === 'cedula'      && <CedulaPanel pet={pet} theme={theme} navigate={navigate} />}
              {activeTab === 'medico'      && <MedicoPanel pet={pet} theme={theme} />}
              {activeTab === 'gps'         && (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--color-text)' }}>📍 GPS & Ubicación</h2>
                  <GPSWidget theme={theme} />
                </div>
              )}
              {activeTab === 'dieta'       && <DietaPage embedded />}
              {activeTab === 'cuidadores'  && <CuidadoresPage embedded />}
              {activeTab === 'rutas'       && <RutasPage embedded />}
              {activeTab === 'veterinario' && <VetChatPage embedded />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
