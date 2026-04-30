import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import {
  PawPrint, CreditCard, MapPin, Activity, Apple, Dumbbell,
  Calendar, ChevronLeft, ChevronRight, Menu, X, Plus,
  Shield, AlertTriangle, Clock, TrendingUp,
} from 'lucide-react'
import { usePets } from '../context/PetContext'
import { usePetTheme } from '../hooks/usePetTheme'

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SPECIES_EMOJI = { dog:'🐕', cat:'🐈', rabbit:'🐰', bird:'🦜', reptile:'🦎', fish:'🐠', hamster:'🐹', other:'🐾' }

const SIDEBAR_ITEMS = [
  { key:'ficha', label:'Mi Mascota', icon:PawPrint, path:'/dashboard' },
  { key:'cedula', label:'Mi Cédula PAWID', icon:CreditCard, path:'/cedula' },
  { key:'gps', label:'GPS & Ubicación', icon:MapPin, path:null },
  { key:'medico', label:'Historial Médico', icon:Activity, path:null },
  { key:'dieta', label:'Dieta & Nutrición', icon:Apple, path:'/dieta' },
  { key:'ejercicio', label:'Ejercicio & Rutinas', icon:Dumbbell, path:null },
  { key:'citas', label:'Próximas Citas', icon:Calendar, path:null },
]

// Custom paw icon for Leaflet
const pawIcon = new L.DivIcon({
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 0 8px rgba(124,58,237,0.8))">🐾</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  className: '',
})

// Weight history mock generator
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

// ─── GPS Widget ───────────────────────────────────────────────────────────────
function GPSWidget({ theme }) {
  const [mapReady, setMapReady] = useState(false)
  const center = [-33.4489, -70.6693] // Santiago

  useEffect(() => {
    const t = setTimeout(() => setMapReady(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="glass-dark rounded-2xl overflow-hidden">
      {/* Map */}
      <div style={{ height: 280, position: 'relative' }}>
        {mapReady && (
          <MapContainer
            center={center}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution=""
            />
            <Marker position={center} icon={pawIcon}>
              <Popup>📍 Última ubicación conocida</Popup>
            </Marker>
          </MapContainer>
        )}
        {/* GPS overlay */}
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 1000,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
          borderRadius: 12, padding: '8px 14px',
          border: '1px solid rgba(16,185,129,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 8px #10B981',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontFamily: 'var(--font-sub)', fontSize: 12, color: '#6EE7B7', fontWeight: 600 }}>
              En zona segura ✅
            </span>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex justify-between items-start">
          <div>
            <p style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>
              📍 Última ubicación: hace 3 minutos
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
              Av. Providencia 1234, Santiago
            </p>
          </div>
          <div style={{
            background: 'rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 10, padding: '6px 12px',
            fontFamily: 'var(--font-sub)', fontSize: 11, color: '#FCD34D',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16 }}>📡</div>
            <div>GPS Tracker™</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>Disponible</div>
          </div>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(245,158,11,0.7)', marginTop: 8, fontStyle: 'italic' }}>
          GPS en tiempo real disponible con dispositivo PAWID Tracker™
        </p>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }`}</style>
    </div>
  )
}

// ─── Health quick cards ───────────────────────────────────────────────────────
function HealthCards({ pet, theme }) {
  const nextVax = (pet.vaccines || [])
    .filter(v => v.nextDate && new Date(v.nextDate) > new Date())
    .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate))[0]

  const activeConditions = (pet.conditions || []).filter(c => c.status === 'activa').length

  const cards = [
    {
      icon: '💉',
      label: 'Próxima vacuna',
      value: nextVax ? nextVax.name : 'Sin pendientes',
      sub: nextVax ? nextVax.nextDate : '✅ Al día',
      color: nextVax ? '#F59E0B' : '#10B981',
    },
    {
      icon: '⚖️',
      label: 'Peso actual',
      value: pet.weight ? `${pet.weight} kg` : '—',
      sub: 'Última actualización: hoy',
      color: theme.primary,
    },
    {
      icon: '🏥',
      label: 'Condiciones activas',
      value: activeConditions || 'Ninguna',
      sub: activeConditions > 0 ? `${activeConditions} bajo seguimiento` : '✅ Sin condiciones',
      color: activeConditions > 0 ? '#EF4444' : '#10B981',
    },
    {
      icon: '⚠️',
      label: 'Alergias',
      value: (pet.allergies || []).length || 'Ninguna',
      sub: (pet.allergies || []).slice(0, 2).join(', ') || 'Sin alergias registradas',
      color: (pet.allergies || []).length > 0 ? '#F59E0B' : '#10B981',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map(({ icon, label, value, sub, color }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4"
          style={{ border: `1px solid ${color}30` }}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
          <p style={{ fontFamily: 'var(--font-sub)', fontSize: 11, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color, marginTop: 2 }}>{value}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>{sub}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Weight chart ─────────────────────────────────────────────────────────────
function WeightChart({ pet, theme }) {
  const data = generateWeightHistory(pet.weight || 5)

  return (
    <div className="glass-dark rounded-2xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h4 style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} style={{ color: theme.primary }} />
          Evolución de peso
        </h4>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-muted)' }}>Últimos 6 meses</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.primary} stopOpacity={0.4} />
              <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'rgba(250,250,250,0.5)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'rgba(250,250,250,0.5)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'rgba(15,10,30,0.9)', border: `1px solid ${theme.primary}40`, borderRadius: 10, fontFamily: 'var(--font-sub)', fontSize: 12, color: 'white' }}
            formatter={(v) => [`${v} kg`, 'Peso']}
          />
          <Area type="monotone" dataKey="peso" stroke={theme.primary} strokeWidth={2} fill="url(#weightGrad)" dot={{ fill: theme.primary, r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Pet ficha panel ──────────────────────────────────────────────────────────
function PetFicha({ pet, theme, navigate }) {
  return (
    <div className="space-y-6">
      {/* Avatar + name */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-2xl p-6 flex gap-5 items-center">
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: pet.photo ? `url(${pet.photo}) center/cover no-repeat` : `${theme.primary}30`,
          border: `3px solid ${theme.primary}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0,
          boxShadow: `0 0 20px ${theme.glow}`,
        }}>
          {!pet.photo && (SPECIES_EMOJI[pet.species] || '🐾')}
        </div>
        <div className="flex-1">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--color-text)' }}>{pet.name}</h2>
          <p style={{ fontFamily: 'var(--font-sub)', fontSize: 14, color: 'var(--color-muted)' }}>
            {pet.breed || ''} · {pet.sex || ''} · {pet.weight ? `${pet.weight} kg` : ''}
          </p>
          <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: theme.primary, background: `${theme.primary}18`, padding: '4px 10px', borderRadius: 6, display: 'inline-block' }}>
            {pet.pawid}
          </div>
        </div>
        <button className="btn-primary btn-sm" onClick={() => navigate('/cedula')}>
          <CreditCard size={14} /> Ver cédula
        </button>
      </motion.div>

      <HealthCards pet={pet} theme={theme} />
      <WeightChart pet={pet} theme={theme} />
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { pets, activePetId, setActivePetId } = usePets()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('ficha')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const pet = pets.find(p => p.id === activePetId) || pets[0]
  const theme = usePetTheme(pet?.species)

  useEffect(() => {
    if (pet?.species) theme.apply()
  }, [pet?.species])

  if (!pet) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <span style={{ fontSize: 64 }}>🐾</span>
        <p style={{ fontFamily: 'var(--font-sub)', fontSize: 18, color: 'var(--color-muted)' }}>No tienes mascotas registradas.</p>
        <button className="btn-primary" onClick={() => navigate('/crear')}>
          <Plus size={16} /> Crear mi primera mascota
        </button>
      </div>
    )
  }

  const handleSidebarNav = (item) => {
    if (item.path) { navigate(item.path); return }
    setActiveSection(item.key)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingTop: 72 }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at 20% 30%, ${theme.glow} 0%, transparent 50%)` }} />

      <div className="relative z-10 flex max-w-7xl mx-auto px-4 gap-6 py-6">
        {/* ── SIDEBAR ── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ flexShrink: 0, overflow: 'hidden' }}
            >
              <div className="glass-dark rounded-2xl p-4 sticky top-20" style={{ width: 240 }}>
                {/* Pet selector */}
                {pets.length > 1 && (
                  <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontFamily: 'var(--font-sub)', fontSize: 11, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Mis mascotas</p>
                    {pets.map(p => (
                      <button key={p.id} onClick={() => setActivePetId(p.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                          background: p.id === pet.id ? `${theme.primary}25` : 'transparent',
                          color: 'var(--color-text)', fontFamily: 'var(--font-sub)', fontSize: 14,
                          transition: 'background 0.2s', marginBottom: 2,
                        }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: p.photo ? `url(${p.photo}) center/cover` : `${theme.primary}40`,
                          border: p.id === pet.id ? `2px solid ${theme.primary}` : '2px solid transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                        }}>
                          {!p.photo && (SPECIES_EMOJI[p.species] || '🐾')}
                        </div>
                        <span>{p.name}</span>
                      </button>
                    ))}
                    <button onClick={() => navigate('/crear')}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, border: '1px dashed rgba(255,255,255,0.15)', background: 'transparent', color: 'var(--color-muted)', fontFamily: 'var(--font-sub)', fontSize: 13, cursor: 'pointer', marginTop: 4 }}>
                      <Plus size={14} /> Nueva mascota
                    </button>
                  </div>
                )}

                {/* Nav items */}
                <nav className="space-y-1">
                  {SIDEBAR_ITEMS.map(item => {
                    const Icon = item.icon
                    const isActive = activeSection === item.key
                    return (
                      <button key={item.key} onClick={() => handleSidebarNav(item)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                          background: isActive ? `${theme.primary}25` : 'transparent',
                          color: isActive ? 'var(--color-text)' : 'var(--color-muted)',
                          fontFamily: 'var(--font-sub)', fontSize: 14, fontWeight: isActive ? 600 : 400,
                          transition: 'all 0.2s', textAlign: 'left',
                          boxShadow: isActive ? `inset 3px 0 0 ${theme.primary}` : 'none',
                        }}>
                        <Icon size={16} style={{ color: isActive ? theme.primary : 'inherit', flexShrink: 0 }} />
                        {item.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0">
          {/* Toggle sidebar btn */}
          <button onClick={() => setSidebarOpen(s => !s)}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', color: 'var(--color-text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sub)', fontSize: 13 }}>
            {sidebarOpen ? <ChevronLeft size={14} /> : <Menu size={14} />}
            {sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
          </button>

          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              {activeSection === 'ficha' && <PetFicha pet={pet} theme={theme} navigate={navigate} />}
              {activeSection === 'gps' && (
                <div className="space-y-4">
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>📍 GPS & Ubicación</h2>
                  <GPSWidget theme={theme} />
                </div>
              )}
              {activeSection === 'medico' && (
                <div className="space-y-4">
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>🏥 Historial Médico</h2>
                  <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-muted)' }}>Ver historial completo en la <button onClick={() => navigate('/cedula')} style={{ background: 'none', border: 'none', color: theme.primary, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}>cédula PAWID</button>.</p>
                  <HealthCards pet={pet} theme={theme} />
                </div>
              )}
              {activeSection === 'ejercicio' && (
                <div className="glass-dark rounded-2xl p-6">
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>🏃 Ejercicio & Rutinas</h2>
                  <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-muted)', marginBottom: 20 }}>Rutina personalizada para {pet.name}</p>
                  <div className="grid grid-cols-7 gap-2">
                    {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((day, i) => (
                      <div key={day} className="glass rounded-xl p-3 text-center">
                        <p style={{ fontFamily: 'var(--font-sub)', fontSize: 11, color: 'var(--color-muted)', marginBottom: 6 }}>{day}</p>
                        <div style={{ fontSize: 20 }}>{i < 5 ? '🏃' : i === 5 ? '🌿' : '😴'}</div>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--color-muted)', marginTop: 4 }}>{i < 5 ? '30 min' : i === 5 ? 'Paseo largo' : 'Descanso'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeSection === 'citas' && (
                <div className="glass-dark rounded-2xl p-6">
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16 }}>📅 Próximas Citas</h2>
                  {(pet.vaccines || []).filter(v => v.nextDate && new Date(v.nextDate) > new Date()).length === 0
                    ? <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-muted)' }}>No hay citas programadas. Todas las vacunas al día.</p>
                    : (pet.vaccines || []).filter(v => v.nextDate && new Date(v.nextDate) > new Date())
                        .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate))
                        .map(v => (
                          <div key={v.id} className="glass rounded-xl p-4 mb-3 flex justify-between items-center">
                            <div>
                              <p style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 15, color: 'var(--color-text)' }}>💉 {v.name}</p>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-muted)' }}>{v.vet || 'Veterinaria no especificada'}</p>
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: theme.primary, background: `${theme.primary}18`, padding: '4px 12px', borderRadius: 8 }}>
                              {v.nextDate}
                            </div>
                          </div>
                        ))
                  }
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
