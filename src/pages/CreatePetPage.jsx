import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import {
  ChevronRight, ChevronLeft, Check, Plus, Trash2,
  Upload, Calendar, Weight, Ruler, Cpu, Scissors,
  Syringe, AlertCircle, X
} from 'lucide-react'
import { usePets } from '../context/PetContext'
import { usePetTheme } from '../hooks/usePetTheme'
import ParticleField from '../components/ParticleField'

// ─── Constants ────────────────────────────────────────────────────────────────
const SPECIES = [
  { key: 'dog', emoji: '🐕', label: 'Perro' },
  { key: 'cat', emoji: '🐈', label: 'Gato' },
  { key: 'rabbit', emoji: '🐰', label: 'Conejo' },
  { key: 'bird', emoji: '🦜', label: 'Ave/Loro' },
  { key: 'reptile', emoji: '🦎', label: 'Reptil' },
  { key: 'fish', emoji: '🐠', label: 'Pez' },
  { key: 'hamster', emoji: '🐹', label: 'Hámster' },
  { key: 'other', emoji: '🐾', label: 'Otro' },
]

const BREEDS = {
  dog: ['Labrador Retriever', 'Golden Retriever', 'Pastor Alemán', 'Bulldog Francés', 'Poodle', 'Chihuahua', 'Beagle', 'Boxer', 'Husky Siberiano', 'Shih Tzu', 'Mestizo'],
  cat: ['Persa', 'Siamés', 'Maine Coon', 'Ragdoll', 'Bengalí', 'Sphynx', 'British Shorthair', 'Abisinio', 'Mestizo'],
  rabbit: ['Holandés', 'Mini Rex', 'Lionhead', 'Angora', 'Californiano', 'Mestizo'],
  bird: ['Canario', 'Periquito', 'Agaporni', 'Ninfa', 'Loro Gris', 'Amazona', 'Cacatúa'],
  reptile: ['Iguana Verde', 'Gecko Leopardo', 'Dragón Barbudo', 'Tortuga de Tierra', 'Serpiente del Maíz'],
  fish: ['Betta', 'Goldfish', 'Guppy', 'Neon Tetra', 'Disco', 'Koi'],
  hamster: ['Sirio Dorado', 'Enano Ruso', 'Roborovski', 'Chino'],
  other: ['Raza desconocida'],
}

const PHYSIO = [
  { key: 'longHair', label: 'Pelo largo' },
  { key: 'shortHair', label: 'Pelo corto' },
  { key: 'noHair', label: 'Sin pelo' },
  { key: 'scales', label: 'Escamas' },
  { key: 'feathers', label: 'Plumas' },
  { key: 'curlyHair', label: 'Pelo rizado' },
]

const COLORS = [
  '#7C3AED','#F59E0B','#EF4444','#10B981','#3B82F6','#EC4899',
  '#F97316','#14B8A6','#8B5CF6','#F3F4F6','#374151','#92400E',
]

const STEPS = ['Identidad', 'Datos Físicos', 'Historial Médico', 'Confirmación']

function generatePawId(species, year = new Date().getFullYear()) {
  const map = { dog:'DOG',cat:'CAT',rabbit:'RAB',bird:'BRD',reptile:'REP',fish:'FSH',hamster:'HMS',other:'PET' }
  const code = map[species] || 'PET'
  const uid = uuidv4().replace(/-/g,'').toUpperCase().slice(0, 8)
  return `PAW-${code}-${year}-${uid}`
}

function calculateAge(dob) {
  if (!dob) return ''
  const birth = new Date(dob)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) { years--; months += 12 }
  if (years === 0) return `${months} mes${months !== 1 ? 'es' : ''}`
  return `${years} año${years !== 1 ? 's' : ''} ${months > 0 ? `${months} mes${months !== 1 ? 'es' : ''}` : ''}`
}

// ─── Step 1: Identity ─────────────────────────────────────────────────────────
function Step1({ data, onChange, theme }) {
  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange('photo', ev.target.result)
    reader.readAsDataURL(file)
  }

  const togglePhysio = (key) => {
    const current = data.physio || []
    onChange('physio', current.includes(key) ? current.filter(k => k !== key) : [...current, key])
  }

  return (
    <div className="wizard-step space-y-6">
      <div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--orange)', marginBottom:6, fontFamily:'var(--font-display)' }}>Paso 1 de 4</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800 }}>Identidad & Apariencia</h2>
      </div>

      {/* Name */}
      <div>
        <label style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>
          Nombre de la mascota *
        </label>
        <input
          className="input-styled"
          placeholder="ej. Luna, Max, Pelusa..."
          value={data.name || ''}
          onChange={e => onChange('name', e.target.value)}
        />
      </div>

      {/* Species */}
      <div>
        <label style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-muted)', display: 'block', marginBottom: '12px' }}>
          Especie *
        </label>
        <div className="grid grid-cols-4 gap-3">
          {SPECIES.map(s => (
            <button
              key={s.key}
              type="button"
              className={`species-btn ${data.species === s.key ? 'active' : ''}`}
              onClick={() => onChange('species', s.key)}
            >
              <span className="species-emoji">{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Breed */}
      {data.species && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <label style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>
            Raza
          </label>
          <div style={{ position: 'relative' }}>
            <input
              className="input-styled"
              placeholder="Escribe o selecciona la raza..."
              list={`breeds-${data.species}`}
              value={data.breed || ''}
              onChange={e => onChange('breed', e.target.value)}
            />
            <datalist id={`breeds-${data.species}`}>
              {(BREEDS[data.species] || []).map(b => <option key={b} value={b} />)}
            </datalist>
          </div>
        </motion.div>
      )}

      {/* Color swatches */}
      <div>
        <label style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-muted)', display: 'block', marginBottom: '10px' }}>
          Color / pelaje principal
        </label>
        <div className="flex flex-wrap gap-3 items-center">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => onChange('color', c)}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: c,
                border: data.color === c ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'transform 0.15s',
                transform: data.color === c ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
          <input
            type="color"
            value={data.color || '#7C3AED'}
            onChange={e => onChange('color', e.target.value)}
            style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none',
              cursor: 'pointer', background: 'transparent', padding: 0,
            }}
            title="Color personalizado"
          />
        </div>
      </div>

      {/* Physio */}
      <div>
        <label style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-muted)', display: 'block', marginBottom: '10px' }}>
          Características físicas
        </label>
        <div className="flex flex-wrap gap-2">
          {PHYSIO.map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => togglePhysio(p.key)}
              className="tag"
              style={{
                background: (data.physio || []).includes(p.key) ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${(data.physio || []).includes(p.key) ? 'var(--pet-primary)' : 'rgba(255,255,255,0.15)'}`,
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              {(data.physio || []).includes(p.key) && <Check size={12} />}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo */}
      <div>
        <label style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-muted)', display: 'block', marginBottom: '10px' }}>
          Foto de la mascota
        </label>
        <div className="flex items-center gap-6">
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: data.photo ? `url(${data.photo}) center/cover` : 'rgba(124,58,237,0.15)',
            border: `3px solid var(--pet-primary)`,
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {!data.photo && <span style={{ fontSize: 28 }}>{SPECIES.find(s => s.key === data.species)?.emoji || '🐾'}</span>}
          </div>
          <label style={{ cursor: 'pointer' }}>
            <div className="btn-ghost btn-sm" style={{ pointerEvents: 'none' }}>
              <Upload size={14} />
              Subir foto
            </div>
            <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Physical data ────────────────────────────────────────────────────
function Step2({ data, onChange }) {
  return (
    <div className="wizard-step space-y-6">
      <div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--orange)', marginBottom:6, fontFamily:'var(--font-display)' }}>Paso 2 de 4</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800 }}>Datos Físicos</h2>
      </div>

      {/* DOB */}
      <div>
        <label style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>
          <Calendar size={14} style={{ display: 'inline', marginRight: 6 }} />
          Fecha de nacimiento
        </label>
        <input
          type="date"
          className="input-styled"
          value={data.dob || ''}
          onChange={e => onChange('dob', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
        {data.dob && (
          <p style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-secondary)', marginTop: 6 }}>
            Edad: {calculateAge(data.dob)}
          </p>
        )}
      </div>

      {/* Weight */}
      <div>
        <label style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>
          <Weight size={14} style={{ display: 'inline', marginRight: 6 }} />
          Peso actual: <strong style={{ color: 'var(--color-text)' }}>{data.weight || 0} kg</strong>
        </label>
        <input
          type="range" min={0.1} max={100} step={0.1}
          value={data.weight || 5}
          onChange={e => onChange('weight', parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--pet-primary)', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
          <span>0.1 kg</span><span>100 kg</span>
        </div>
      </div>

      {/* Height */}
      <div>
        <label style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>
          <Ruler size={14} style={{ display: 'inline', marginRight: 6 }} />
          Talla / altura (cm)
        </label>
        <input
          type="number" min={1} max={300}
          className="input-styled"
          placeholder="ej. 45"
          value={data.height || ''}
          onChange={e => onChange('height', e.target.value)}
        />
      </div>

      {/* Sex */}
      <div>
        <label style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>
          Sexo
        </label>
        <div className="toggle-group">
          {['Macho', 'Hembra', 'No determinado'].map(s => (
            <button key={s} type="button"
              className={`toggle-btn ${data.sex === s ? 'active' : ''}`}
              onClick={() => onChange('sex', s)}>
              {s === 'Macho' ? '♂️' : s === 'Hembra' ? '♀️' : '⚧️'} {s}
            </button>
          ))}
        </div>
      </div>

      {/* Microchip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cpu size={14} /> Microchip
          </label>
          <button
            type="button"
            onClick={() => onChange('hasMicrochip', !data.hasMicrochip)}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: data.hasMicrochip ? 'var(--pet-primary)' : 'rgba(255,255,255,0.15)',
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            }}>
            <span style={{
              position: 'absolute', top: 3, left: data.hasMicrochip ? 22 : 3,
              width: 18, height: 18, borderRadius: '50%', background: 'white',
              transition: 'left 0.2s',
            }} />
          </button>
        </div>
        {data.hasMicrochip && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <input className="input-styled" placeholder="Número de microchip"
              value={data.microchipNum || ''}
              onChange={e => onChange('microchipNum', e.target.value)}
            />
          </motion.div>
        )}
      </div>

      {/* Sterilized */}
      <div className="flex items-center justify-between">
        <label style={{ fontFamily: 'var(--font-sub)', fontSize: '13px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Scissors size={14} /> Esterilizado/a
        </label>
        <button
          type="button"
          onClick={() => onChange('sterilized', !data.sterilized)}
          style={{
            width: 44, height: 24, borderRadius: 12,
            background: data.sterilized ? 'var(--pet-primary)' : 'rgba(255,255,255,0.15)',
            border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
          }}>
          <span style={{
            position: 'absolute', top: 3, left: data.sterilized ? 22 : 3,
            width: 18, height: 18, borderRadius: '50%', background: 'white',
            transition: 'left 0.2s',
          }} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: Medical history ──────────────────────────────────────────────────
function VaccineStatus(date) {
  if (!date) return 'exp'
  const diff = new Date(date) - new Date()
  if (diff < 0) return 'exp'
  if (diff < 1000 * 60 * 60 * 24 * 30) return 'warn'
  return 'ok'
}

function Step3({ data, onChange }) {
  const [activeTab, setActiveTab] = useState('vaccines')

  const vaccines = data.vaccines || []
  const conditions = data.conditions || []
  const procedures = data.procedures || []
  const allergies = data.allergies || []
  const [allergyInput, setAllergyInput] = useState('')

  const updateList = (key, list) => onChange(key, list)

  const addVaccine = () => updateList('vaccines', [...vaccines, { id: uuidv4(), name: '', date: '', nextDate: '', vet: '' }])
  const updateVaccine = (id, field, val) => updateList('vaccines', vaccines.map(v => v.id === id ? { ...v, [field]: val } : v))
  const removeVaccine = (id) => updateList('vaccines', vaccines.filter(v => v.id !== id))

  const addCondition = () => updateList('conditions', [...conditions, { id: uuidv4(), name: '', diagDate: '', status: 'activa', treatment: '' }])
  const updateCondition = (id, field, val) => updateList('conditions', conditions.map(c => c.id === id ? { ...c, [field]: val } : c))
  const removeCondition = (id) => updateList('conditions', conditions.filter(c => c.id !== id))

  const addProcedure = () => updateList('procedures', [...procedures, { id: uuidv4(), name: '', date: '', clinic: '', notes: '' }])
  const updateProcedure = (id, field, val) => updateList('procedures', procedures.map(p => p.id === id ? { ...p, [field]: val } : p))
  const removeProcedure = (id) => updateList('procedures', procedures.filter(p => p.id !== id))

  const addAllergy = () => {
    if (!allergyInput.trim()) return
    updateList('allergies', [...allergies, allergyInput.trim()])
    setAllergyInput('')
  }

  const TABS = ['vaccines', 'conditions', 'procedures', 'allergies']
  const TAB_LABELS = { vaccines: '💉 Vacunas', conditions: '🏥 Condiciones', procedures: '⚕️ Procedimientos', allergies: '⚠️ Alergias' }

  return (
    <div className="wizard-step space-y-4">
      <div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--orange)', marginBottom:6, fontFamily:'var(--font-display)' }}>Paso 3 de 4</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800 }}>Historial Médico</h2>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 0 }}>
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>

          {/* Vaccines */}
          {activeTab === 'vaccines' && (
            <div className="space-y-3">
              {vaccines.map(v => {
                const st = VaccineStatus(v.nextDate)
                return (
                  <div key={v.id} className="glass rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`tag tag-vaccine-${st}`}>
                        {st === 'ok' ? '✅ Al día' : st === 'warn' ? '⚠️ Próxima a vencer' : '❌ Vencida'}
                      </span>
                      <button type="button" onClick={() => removeVaccine(v.id)}
                        style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input className="input-styled" placeholder="Nombre de vacuna" value={v.name}
                        onChange={e => updateVaccine(v.id, 'name', e.target.value)} />
                      <input className="input-styled" placeholder="Veterinaria" value={v.vet}
                        onChange={e => updateVaccine(v.id, 'vet', e.target.value)} />
                      <div>
                        <label style={{ fontFamily: 'var(--font-sub)', fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Aplicación</label>
                        <input type="date" className="input-styled" value={v.date}
                          onChange={e => updateVaccine(v.id, 'date', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontFamily: 'var(--font-sub)', fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Próxima dosis</label>
                        <input type="date" className="input-styled" value={v.nextDate}
                          onChange={e => updateVaccine(v.id, 'nextDate', e.target.value)} />
                      </div>
                    </div>
                  </div>
                )
              })}
              <button type="button" className="btn-ghost btn-sm w-full justify-center" onClick={addVaccine}>
                <Plus size={14} /> Agregar vacuna
              </button>
            </div>
          )}

          {/* Conditions */}
          {activeTab === 'conditions' && (
            <div className="space-y-3">
              {conditions.map(c => (
                <div key={c.id} className="glass rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <select className="input-styled" value={c.status}
                      onChange={e => updateCondition(c.id, 'status', e.target.value)}
                      style={{ maxWidth: 160 }}>
                      <option value="activa">Activa</option>
                      <option value="controlada">Controlada</option>
                      <option value="resuelta">Resuelta</option>
                    </select>
                    <button type="button" onClick={() => removeCondition(c.id)}
                      style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-styled" placeholder="Diagnóstico / condición" value={c.name}
                      onChange={e => updateCondition(c.id, 'name', e.target.value)} />
                    <div>
                      <label style={{ fontFamily: 'var(--font-sub)', fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Fecha diagnóstico</label>
                      <input type="date" className="input-styled" value={c.diagDate}
                        onChange={e => updateCondition(c.id, 'diagDate', e.target.value)} />
                    </div>
                    <input className="input-styled col-span-2" placeholder="Tratamiento actual" value={c.treatment}
                      onChange={e => updateCondition(c.id, 'treatment', e.target.value)} />
                  </div>
                </div>
              ))}
              <button type="button" className="btn-ghost btn-sm w-full justify-center" onClick={addCondition}>
                <Plus size={14} /> Agregar condición
              </button>
            </div>
          )}

          {/* Procedures */}
          {activeTab === 'procedures' && (
            <div className="space-y-3">
              {procedures.map(p => (
                <div key={p.id} className="glass rounded-xl p-4 space-y-3">
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeProcedure(p.id)}
                      style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-styled" placeholder="Nombre del procedimiento" value={p.name}
                      onChange={e => updateProcedure(p.id, 'name', e.target.value)} />
                    <input className="input-styled" placeholder="Clínica / veterinaria" value={p.clinic}
                      onChange={e => updateProcedure(p.id, 'clinic', e.target.value)} />
                    <div>
                      <label style={{ fontFamily: 'var(--font-sub)', fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Fecha</label>
                      <input type="date" className="input-styled" value={p.date}
                        onChange={e => updateProcedure(p.id, 'date', e.target.value)} />
                    </div>
                    <input className="input-styled" placeholder="Observaciones" value={p.notes}
                      onChange={e => updateProcedure(p.id, 'notes', e.target.value)} />
                  </div>
                </div>
              ))}
              <button type="button" className="btn-ghost btn-sm w-full justify-center" onClick={addProcedure}>
                <Plus size={14} /> Agregar procedimiento
              </button>
            </div>
          )}

          {/* Allergies */}
          {activeTab === 'allergies' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input className="input-styled" placeholder="ej. Pollo, Mariscos, Polen..."
                  value={allergyInput}
                  onChange={e => setAllergyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAllergy()}
                />
                <button type="button" className="btn-primary btn-sm" onClick={addAllergy} style={{ flexShrink: 0 }}>
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergies.map((a, i) => (
                  <span key={i} className="tag tag-allergy" style={{ cursor: 'pointer' }}
                    onClick={() => updateList('allergies', allergies.filter((_, j) => j !== i))}>
                    <AlertCircle size={11} /> {a} <X size={11} />
                  </span>
                ))}
                {allergies.length === 0 && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-muted)' }}>
                    No hay alergias registradas.
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Step 4: Confirmation ─────────────────────────────────────────────────────
function Step4({ data, pawid, generating }) {
  const speciesInfo = SPECIES.find(s => s.key === data.species)

  return (
    <div className="wizard-step space-y-6">
      <div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--orange)', marginBottom:6, fontFamily:'var(--font-display)' }}>¡Completado!</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800 }}>🎉 ¡Tu PAWID está listo!</h2>
      </div>

      {/* Preview card */}
      <motion.div
        className={`glass-dark rounded-2xl p-6 ${generating ? 'gen-anim' : ''}`}
        style={{ border: '1px solid rgba(124,58,237,0.4)', position: 'relative', overflow: 'hidden' }}
      >
        {generating && <ParticleField count={40} color="var(--pet-primary)" />}
        <div className="relative z-10 flex gap-6 flex-wrap">
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: data.photo ? `url(${data.photo}) center/cover` : 'rgba(124,58,237,0.2)',
            border: '3px solid var(--pet-primary)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          }}>
            {!data.photo && (speciesInfo?.emoji || '🐾')}
          </div>
          <div className="flex-1 min-w-0">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
              {data.name || 'Sin nombre'}
            </h3>
            <p style={{ fontFamily: 'var(--font-sub)', fontSize: '14px', color: 'var(--color-muted)' }}>
              {speciesInfo?.label || ''} {data.breed ? `· ${data.breed}` : ''} {data.sex ? `· ${data.sex}` : ''}
            </p>
            {data.dob && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-muted)', marginTop: 4 }}>
                {calculateAge(data.dob)} · {data.weight ? `${data.weight} kg` : ''}
              </p>
            )}
            {pawid && (
              <div style={{
                marginTop: 12,
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--pet-primary)',
                background: 'rgba(124,58,237,0.1)',
                padding: '6px 12px',
                borderRadius: 8,
                display: 'inline-block',
                letterSpacing: '1px',
              }}>
                {pawid}
              </div>
            )}
          </div>
        </div>

        {/* Medical summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Vacunas', val: (data.vaccines || []).length, icon: '💉' },
            { label: 'Condiciones', val: (data.conditions || []).length, icon: '🏥' },
            { label: 'Procedimientos', val: (data.procedures || []).length, icon: '⚕️' },
            { label: 'Alergias', val: (data.allergies || []).length, icon: '⚠️' },
          ].map(({ label, val, icon }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 12,
              padding: '10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 20 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--pet-primary)' }}>{val}</div>
              <div style={{ fontFamily: 'var(--font-sub)', fontSize: 11, color: 'var(--color-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Wizard Shell ─────────────────────────────────────────────────────────────
export default function CreatePetPage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ species: '', name: '', weight: 5 })
  const [pawid, setPawid] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const { addPet, setActivePetId, setCurrentTheme } = usePets()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isRequired = searchParams.get('required') === 'true'
  const theme = usePetTheme(data.species)

  useEffect(() => {
    if (data.species) {
      theme.apply()
      setCurrentTheme(data.species)
    }
  }, [data.species])

  const onChange = (key, val) => setData(prev => ({ ...prev, [key]: val }))

  const canNext = () => {
    if (step === 0) return data.name?.trim() && data.species
    return true
  }

  const handleNext = () => {
    if (step < 3) { setStep(s => s + 1); return }
    handleGenerate()
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenError('')
    try {
      const pet = await addPet({
        name:         data.name,
        species:      data.species,
        breed:        data.breed,
        color:        data.color,
        sex:          data.sex,
        dob:          data.dob,
        weight:       data.weight,
        height:       data.height,
        hasMicrochip: data.hasMicrochip,
        microchipNum: data.microchipNum,
        sterilized:   data.sterilized,
        photo:        data.photo,
        physio:       data.physio,
        vaccines:   (data.vaccines   || []).filter(v => v.name?.trim()),
        conditions: (data.conditions || []).filter(c => c.name?.trim()),
        procedures: (data.procedures || []).filter(p => p.name?.trim()),
        allergies:  (data.allergies  || []).filter(a => a?.trim?.() || a?.name?.trim()),
      })
      setActivePetId(pet.id)
      setPawid(pet.pawid)
      if (isRequired) {
        navigate('/dashboard', { replace: true })
      } else if (!localStorage.getItem('pawid_welcomed')) {
        navigate('/bienvenida', { replace: true })
      } else {
        navigate(`/cedula/${pet.id}`)
      }
    } catch (err) {
      setGenError(err.message || 'Error al crear la mascota. Intenta de nuevo.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 100, paddingBottom: 60, background: 'var(--color-bg)' }}>
      {/* Mesh bg */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse at 20% 20%, ${theme.glow} 0%, transparent 60%),
                     radial-gradient(ellipse at 80% 80%, rgba(245,158,11,0.1) 0%, transparent 60%)`,
      }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="section-eyebrow">{isRequired ? 'Paso 2 de 2' : 'Crear Perfil'}</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing:-1 }}>
            {isRequired ? 'Registra tu primera ' : 'Dale identidad a tu '}
            <span style={{ background:'var(--grad-fire)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              mascota
            </span>
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-muted)', marginTop: 8 }}>
            {isRequired
              ? 'Obligatorio para acceder al sistema. Siempre puedes editar estos datos.'
              : `En ${STEPS.length} simples pasos, tu mascota tendrá su cédula PAWID única.`}
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-8">
          {/* Segment bars */}
          <div style={{ display:'flex', gap: 8, marginBottom: 20 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, transition: 'background 0.4s',
                background: i <= step ? 'var(--grad-fire)' : 'rgba(255,255,255,0.10)' }} />
            ))}
          </div>
          {/* Step indicators */}
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flex:1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i < step ? 'var(--grad-fire)' : i === step ? 'rgba(255,107,0,0.2)' : 'rgba(255,255,255,0.06)',
                  border: i === step ? '2px solid var(--orange)' : i < step ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'white',
                  boxShadow: i === step ? '0 0 16px rgba(255,107,0,0.35)' : 'none',
                  transition: 'all 0.3s',
                }}>
                  {i < step ? <Check size={15} /> : i + 1}
                </div>
                <span style={{ fontFamily:'var(--font-display)', fontSize:10, letterSpacing:0.5, color: i <= step ? 'var(--color-text)' : 'var(--color-muted)', textAlign:'center' }}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="glass-dark rounded-3xl p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {step === 0 && <Step1 data={data} onChange={onChange} theme={theme} />}
              {step === 1 && <Step2 data={data} onChange={onChange} />}
              {step === 2 && <Step3 data={data} onChange={onChange} />}
              {step === 3 && <Step4 data={data} pawid={pawid} generating={generating} />}
            </motion.div>
          </AnimatePresence>

          {/* Error de generación */}
          {genError && (
            <div style={{ margin: '16px 0 0', padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontFamily: 'var(--font-body)', fontSize: 13 }}>
              {genError}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => step > 0 ? setStep(s => s - 1) : (isRequired ? navigate('/logout') : navigate('/'))}
              disabled={isRequired && step === 0}
              style={{ opacity: isRequired && step === 0 ? 0 : 1, pointerEvents: isRequired && step === 0 ? 'none' : 'auto' }}
            >
              <ChevronLeft size={16} />
              {step === 0 ? 'Cancelar' : 'Anterior'}
            </button>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={handleNext}
              disabled={!canNext() || generating}
              style={{ opacity: !canNext() || generating ? 0.5 : 1 }}
            >
              {step === 3
                ? generating ? '⚡ Generando...' : '🪪 Generar Cédula PAWID'
                : 'Siguiente'}
              {step < 3 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
