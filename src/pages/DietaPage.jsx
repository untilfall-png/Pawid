import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, Calculator, Dumbbell, RefreshCcw } from 'lucide-react'
import { FOOD_DATA } from '../data/mockData'
import { usePetTheme } from '../hooks/usePetTheme'
import { usePets } from '../context/PetContext'

const SPECIES_LIST = [
  { key:'dog', emoji:'🐕', label:'Perro' },
  { key:'cat', emoji:'🐈', label:'Gato' },
  { key:'rabbit', emoji:'🐰', label:'Conejo' },
  { key:'bird', emoji:'🦜', label:'Ave' },
  { key:'reptile', emoji:'🦎', label:'Reptil' },
  { key:'hamster', emoji:'🐹', label:'Hámster' },
]

const ACTIVITY_LEVELS = [
  { key:'low', label:'Bajo', emoji:'😴', desc:'Sedentario, mayormente en interior', multiplier:0.8 },
  { key:'medium', label:'Medio', emoji:'🚶', desc:'Actividad moderada, 1-2 salidas diarias', multiplier:1.0 },
  { key:'high', label:'Alto', emoji:'🏃', desc:'Muy activo, deportivo, al aire libre', multiplier:1.3 },
]

const EXERCISE_PLANS = {
  dog: {
    low:   [{ day:'Lun', acts:['Paseo corto 15 min'], emoji:'🚶' },{ day:'Mar', acts:['Descanso activo'], emoji:'😴' },{ day:'Mié', acts:['Paseo 20 min'], emoji:'🚶' },{ day:'Jue', acts:['Juego en casa 15 min'], emoji:'🎾' },{ day:'Vie', acts:['Paseo 20 min'], emoji:'🚶' },{ day:'Sáb', acts:['Paseo largo 30 min'], emoji:'🌿' },{ day:'Dom', acts:['Descanso'], emoji:'😴' }],
    medium:[{ day:'Lun', acts:['Paseo 30 min', 'Juego 10 min'], emoji:'🚶' },{ day:'Mar', acts:['Trote 20 min'], emoji:'🏃' },{ day:'Mié', acts:['Paseo 30 min'], emoji:'🚶' },{ day:'Jue', acts:['Juego activo 30 min'], emoji:'🎾' },{ day:'Vie', acts:['Paseo 30 min'], emoji:'🚶' },{ day:'Sáb', acts:['Excursión 1h'], emoji:'🌿' },{ day:'Dom', acts:['Paseo suave 20 min'], emoji:'🚶' }],
    high:  [{ day:'Lun', acts:['Trote 45 min', 'Juego 20 min'], emoji:'🏃' },{ day:'Mar', acts:['Agility 30 min'], emoji:'⚡' },{ day:'Mié', acts:['Natación o trote 45 min'], emoji:'🏊' },{ day:'Jue', acts:['Juego intenso 45 min'], emoji:'🎾' },{ day:'Vie', acts:['Trote 45 min'], emoji:'🏃' },{ day:'Sáb', acts:['Senderismo 2h'], emoji:'🏔️' },{ day:'Dom', acts:['Descanso activo 30 min'], emoji:'😴' }],
  },
  cat: {
    low:   [{ day:'Lun', acts:['Juego con varita 10 min'], emoji:'🐱' },{ day:'Mar', acts:['Descanso'], emoji:'😴' },{ day:'Mié', acts:['Sesión de caza 10 min'], emoji:'🎯' },{ day:'Jue', acts:['Descanso'], emoji:'😴' },{ day:'Vie', acts:['Juego interactivo 10 min'], emoji:'🐱' },{ day:'Sáb', acts:['Enriquecimiento ambiental'], emoji:'🌿' },{ day:'Dom', acts:['Descanso'], emoji:'😴' }],
    medium:[{ day:'Lun', acts:['Juego activo 20 min'], emoji:'🎯' },{ day:'Mar', acts:['Enriquecimiento 15 min'], emoji:'🧩' },{ day:'Mié', acts:['Juego de caza 20 min'], emoji:'🐱' },{ day:'Jue', acts:['Exploración 15 min'], emoji:'🗺️' },{ day:'Vie', acts:['Juego varita 20 min'], emoji:'🎯' },{ day:'Sáb', acts:['Sesión larga 30 min'], emoji:'🌿' },{ day:'Dom', acts:['Descanso activo'], emoji:'😴' }],
    high:  [{ day:'Lun', acts:['Juego intenso 30 min'], emoji:'⚡' },{ day:'Mar', acts:['Circuito de obstáculos'], emoji:'🏆' },{ day:'Mié', acts:['Juego activo 30 min'], emoji:'🎯' },{ day:'Jue', acts:['Enriquecimiento 20 min'], emoji:'🧩' },{ day:'Vie', acts:['Juego 30 min'], emoji:'⚡' },{ day:'Sáb', acts:['Harness walk 30 min'], emoji:'🌿' },{ day:'Dom', acts:['Descanso activo 20 min'], emoji:'😴' }],
  },
}

function calcDiet(species, weight, age, activity) {
  const data = FOOD_DATA[species] || FOOD_DATA.other
  const ageNum = parseFloat(age) || 1
  const weightNum = parseFloat(weight) || 5
  const actMult = ACTIVITY_LEVELS.find(a => a.key === activity)?.multiplier || 1
  const ageMult = ageNum < 1 ? 1.5 : ageNum > 7 ? 0.85 : 1
  const kcalPerDay = Math.round(data.kcalPerKg * weightNum * actMult * ageMult)
  const portionsPerDay = species === 'dog' || species === 'cat' ? 2 : species === 'rabbit' ? 3 : 1
  const gramsPerPortion = Math.round((kcalPerDay / portionsPerDay) / 3.5)

  return { kcalPerDay, portionsPerDay, gramsPerPortion, recommended: data.recommended, prohibited: data.prohibited }
}

function ProhibitedTable({ items }) {
  return (
    <div className="glass-dark rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(239,68,68,0.2)' }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,0.06)' }}>
        <AlertTriangle size={16} color="#EF4444" />
        <h4 style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:15, color:'#FCA5A5', letterSpacing:1 }}>⛔ Alimentos PROHIBIDOS</h4>
      </div>
      <div style={{ padding:'12px 20px' }}>
        {items.map((item, i) => (
          <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
            style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 0', borderBottom: i < items.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none', gap:12 }}>
            <div className="flex-1">
              <p style={{ fontFamily:'var(--font-sub)', fontWeight:600, fontSize:14, color:'#FCA5A5' }}>⛔ {item.name}</p>
              <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--color-muted)', marginTop:2 }}>{item.reason}</p>
            </div>
            <span style={{
              flexShrink:0,
              background: item.severity==='alto' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
              border: `1px solid ${item.severity==='alto' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}`,
              borderRadius:20, padding:'2px 10px', fontSize:11,
              color: item.severity==='alto' ? '#FCA5A5' : '#FCD34D',
              fontFamily:'var(--font-sub)', fontWeight:600,
            }}>
              {item.severity === 'alto' ? '🔴 CRÍTICO' : item.severity === 'medio' ? '🟡 MODERADO' : '🟢 BAJO'}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ExercisePlan({ species, activity }) {
  const plan = EXERCISE_PLANS[species]?.[activity] || EXERCISE_PLANS.dog?.medium
  if (!plan) return (
    <div className="glass-dark rounded-2xl p-6">
      <p style={{ fontFamily:'var(--font-body)', color:'var(--color-muted)' }}>Consulta con tu veterinario para un plan específico.</p>
    </div>
  )

  return (
    <div className="glass-dark rounded-2xl p-5">
      <h4 style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:15, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
        <Dumbbell size={16} style={{ color:'var(--gold)' }} />
        <span style={{ background:'var(--grad-fire)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          Rutina semanal recomendada
        </span>
      </h4>
      <div className="grid grid-cols-7 gap-2">
        {plan.map(({ day, acts, emoji }) => (
          <div key={day} style={{ borderRadius:12, padding:'10px 6px', textAlign:'center', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,183,3,0.12)', borderTop:'2px solid var(--orange)' }}>
            <p style={{ fontFamily:'var(--font-sub)', fontSize:10, color:'var(--gold)', marginBottom:4, fontWeight:600 }}>{day}</p>
            <div style={{ fontSize:18, marginBottom:4 }}>{emoji}</div>
            {acts.map(a => (
              <p key={a} style={{ fontFamily:'var(--font-body)', fontSize:9, color:'var(--color-muted)', lineHeight:1.3 }}>{a}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DietaPage() {
  const { pets, activePetId } = usePets()
  const pet = pets.find(p => p.id === activePetId) || pets[0]
  const theme = usePetTheme(pet?.species || 'other')

  const [species, setSpecies] = useState(pet?.species || 'dog')
  const [weight, setWeight] = useState(pet?.weight || 5)
  const [age, setAge] = useState(1)
  const [activity, setActivity] = useState('medium')
  const [showResults, setShowResults] = useState(false)

  const result = useMemo(() => showResults ? calcDiet(species, weight, age, activity) : null, [showResults, species, weight, age, activity])
  const foodData = FOOD_DATA[species] || FOOD_DATA.other

  const handleCalculate = () => setShowResults(true)
  const handleReset = () => setShowResults(false)

  return (
    <div style={{ minHeight:'100vh', paddingTop:100, paddingBottom:80, background:'var(--color-bg)' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', background:`radial-gradient(ellipse at 30% 30%, ${theme.glow} 0%, transparent 50%)` }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} className="mb-10">
          <span className="section-eyebrow">Salud & Nutrición</span>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,4vw,52px)', fontWeight:900, letterSpacing:-1, marginBottom:12 }}>
            Calculadora de{' '}
            <span style={{ background:'var(--grad-fire)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Dieta</span>
          </h1>
          <p style={{ fontFamily:'var(--font-body)', color:'var(--color-muted)', fontSize:15 }}>
            Plan nutricional personalizado según especie, raza, edad y nivel de actividad de tu mascota.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="glass-dark rounded-2xl p-6 space-y-5 sticky top-24">
              <h3 style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:16, display:'flex', alignItems:'center', gap:8 }}>
                <Calculator size={16} style={{ color:'var(--gold)' }} />
                <span style={{ background:'var(--grad-fire)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Calculadora de dieta</span>
              </h3>

              {/* Species */}
              <div>
                <label style={{ fontFamily:'var(--font-sub)', fontSize:12, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>Especie</label>
                <div className="grid grid-cols-3 gap-2">
                  {SPECIES_LIST.map(s => (
                    <button key={s.key} onClick={() => { setSpecies(s.key); setShowResults(false) }}
                      className="species-btn"
                      style={{ padding:'10px 6px', borderColor: species===s.key ? 'var(--pet-primary)' : 'rgba(255,255,255,0.1)', background: species===s.key ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize:22 }}>{s.emoji}</span>
                      <span style={{ fontSize:11 }}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight */}
              <div>
                <label style={{ fontFamily:'var(--font-sub)', fontSize:12, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>
                  Peso: <strong style={{ color:'var(--color-text)' }}>{weight} kg</strong>
                </label>
                <input type="range" min={0.1} max={100} step={0.5} value={weight}
                  onChange={e => { setWeight(+e.target.value); setShowResults(false) }}
                  style={{ width:'100%', accentColor:'var(--pet-primary)' }} />
              </div>

              {/* Age */}
              <div>
                <label style={{ fontFamily:'var(--font-sub)', fontSize:12, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>Edad (años)</label>
                <input type="number" min={0} max={30} step={0.5} className="input-styled" value={age}
                  onChange={e => { setAge(e.target.value); setShowResults(false) }} />
              </div>

              {/* Activity */}
              <div>
                <label style={{ fontFamily:'var(--font-sub)', fontSize:12, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>Nivel de actividad</label>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {ACTIVITY_LEVELS.map(a => (
                    <button key={a.key} onClick={() => { setActivity(a.key); setShowResults(false) }}
                      style={{
                        display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, cursor:'pointer',
                        border:`1px solid ${activity===a.key ? 'var(--pet-primary)' : 'rgba(255,255,255,0.1)'}`,
                        background: activity===a.key ? 'rgba(124,58,237,0.15)' : 'transparent',
                        color:'var(--color-text)', fontFamily:'var(--font-sub)', fontSize:13, textAlign:'left',
                      }}>
                      <span style={{ fontSize:18 }}>{a.emoji}</span>
                      <div>
                        <div style={{ fontWeight:600 }}>{a.label}</div>
                        <div style={{ fontSize:11, color:'var(--color-muted)', marginTop:1 }}>{a.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn-primary w-full justify-center" style={{ width:'100%' }} onClick={handleCalculate}>
                <Calculator size={16} />
                Calcular plan nutricional
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-6">
                  {/* Kcal cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label:'Calorías/día', value:`${result.kcalPerDay} kcal`, emoji:'⚡', grad:'var(--grad-fire)', border:'rgba(255,107,0,0.25)' },
                      { label:'Porciones/día', value:`${result.portionsPerDay}`, emoji:'🍽️', grad:'var(--grad-cosmic)', border:'rgba(138,43,226,0.25)' },
                      { label:'Gramos/porción', value:`${result.gramsPerPortion} g`, emoji:'⚖️', grad:'linear-gradient(135deg, #FFB703 0%, #FF8C00 100%)', border:'rgba(255,183,3,0.25)' },
                    ].map(({ label, value, emoji, grad, border }) => (
                      <motion.div key={label} initial={{ scale:0.8 }} animate={{ scale:1 }}
                        className="glass rounded-2xl p-4 text-center"
                        style={{ border:`1px solid ${border}`, boxShadow:`0 0 20px ${border}` }}>
                        <div style={{ fontSize:28, marginBottom:4 }}>{emoji}</div>
                        <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, background:grad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{value}</div>
                        <div style={{ fontFamily:'var(--font-sub)', fontSize:11, color:'var(--color-muted)', marginTop:2 }}>{label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recommended */}
                  <div className="glass-dark rounded-2xl p-5">
                    <h4 style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:15, color:'var(--color-text)', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                      <CheckCircle size={16} color="#10B981" />
                      Alimentos recomendados
                    </h4>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {result.recommended.map(f => (
                        <span key={f} style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:20, padding:'5px 14px', fontSize:13, color:'#6EE7B7', fontFamily:'var(--font-sub)' }}>
                          ✅ {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Prohibited */}
                  {result.prohibited && <ProhibitedTable items={result.prohibited} />}

                  {/* Exercise plan */}
                  <ExercisePlan species={species} activity={activity} />

                  <button className="btn-ghost btn-sm" onClick={handleReset}>
                    <RefreshCcw size={14} /> Nueva consulta
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Default: show prohibited table for selected species */}
            {!result && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-6">
                <div className="glass-dark rounded-2xl p-5">
                  <h4 style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:15, color:'var(--color-text)', marginBottom:4 }}>
                    📋 Referencia rápida para {SPECIES_LIST.find(s => s.key === species)?.label || 'tu mascota'}
                  </h4>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--color-muted)', marginBottom:16 }}>
                    Completa el formulario y calcula el plan nutricional personalizado.
                  </p>
                  <h5 style={{ fontFamily:'var(--font-sub)', fontWeight:600, fontSize:13, color:'#6EE7B7', marginBottom:10 }}>Alimentos seguros:</h5>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {(foodData.recommended || []).map(f => (
                      <span key={f} style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:20, padding:'4px 12px', fontSize:12, color:'#6EE7B7', fontFamily:'var(--font-sub)' }}>✅ {f}</span>
                    ))}
                  </div>
                </div>
                {foodData.prohibited && <ProhibitedTable items={foodData.prohibited} />}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
