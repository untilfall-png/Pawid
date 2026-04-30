import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import {
  Download, Share2, Maximize2, X, Plus, ChevronLeft,
  PawPrint, ShieldCheck, Syringe, Scissors, Cpu,
  AlertCircle, Edit3, RotateCcw, Check
} from 'lucide-react'
import { usePets } from '../context/PetContext'
import { usePetTheme } from '../hooks/usePetTheme'

const SPECIES_LABELS = {
  dog:'Perro', cat:'Gato', rabbit:'Conejo', bird:'Ave/Loro',
  reptile:'Reptil', fish:'Pez', hamster:'Hámster', other:'Otro',
}
const SPECIES_EMOJI = {
  dog:'🐕', cat:'🐈', rabbit:'🐰', bird:'🦜',
  reptile:'🦎', fish:'🐠', hamster:'🐹', other:'🐾',
}

function calculateAge(dob) {
  if (!dob) return 'Edad desconocida'
  const birth = new Date(dob)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) { years--; months += 12 }
  if (years === 0) return `${months} mes${months !== 1 ? 'es' : ''}`
  return `${years} año${years !== 1 ? 's' : ''} ${months > 0 ? `${months} mes${months !== 1 ? 'es' : ''}` : ''}`.trim()
}

function vaccineStatusCount(vaccines = []) {
  let ok = 0, warn = 0, exp = 0
  vaccines.forEach(v => {
    if (!v.nextDate) { exp++; return }
    const diff = new Date(v.nextDate) - new Date()
    if (diff < 0) exp++
    else if (diff < 1000 * 60 * 60 * 24 * 30) warn++
    else ok++
  })
  return { ok, warn, exp }
}

// ─── THE PHYSICAL CARD COMPONENT ─────────────────────────────────────────────
export function PetIDCard({ pet, theme, side = 'front', portrait = false }) {
  const qrValue = JSON.stringify({
    pawid: pet.pawid,
    name: pet.name,
    species: pet.species,
    breed: pet.breed || '',
    dob: pet.dob || '',
    chip: pet.microchipNum || null,
    vaccines: (pet.vaccines || []).length,
    url: `${window.location.origin}/perfil/${pet.pawid}`,
  })
  const vaxStatus = vaccineStatusCount(pet.vaccines)

  if (side === 'back') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: theme.gradient,
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* bg pattern */}
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 70% 50%, ${theme.glow} 0%, transparent 60%)` }} />
        <svg style={{ position:'absolute', inset:0, opacity:0.06 }} width="100%" height="100%">
          <defs>
            <pattern id="dotPat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPat)" />
        </svg>
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }} />

        <div className="holographic" style={{ height:8, width:'100%' }} />

        <div style={{ position:'relative', zIndex:10, flex:1, padding:'20px 28px', display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, color:'white', letterSpacing:2 }}>PAWID</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'rgba(255,255,255,0.6)' }}>ANVERSO</div>
          </div>

          {/* Status icons row */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {/* Vaccines */}
            <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:12, padding:'10px 14px', flex:1, minWidth:100 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <Syringe size={14} color="white" />
                <span style={{ fontFamily:'var(--font-sub)', fontSize:11, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:1 }}>Vacunas</span>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {vaxStatus.ok > 0 && <span style={{ background:'rgba(16,185,129,0.3)', border:'1px solid rgba(16,185,129,0.5)', borderRadius:20, padding:'2px 8px', fontSize:11, color:'#6EE7B7' }}>✅ {vaxStatus.ok} al día</span>}
                {vaxStatus.warn > 0 && <span style={{ background:'rgba(245,158,11,0.3)', border:'1px solid rgba(245,158,11,0.5)', borderRadius:20, padding:'2px 8px', fontSize:11, color:'#FCD34D' }}>⚠️ {vaxStatus.warn}</span>}
                {vaxStatus.exp > 0 && <span style={{ background:'rgba(239,68,68,0.3)', border:'1px solid rgba(239,68,68,0.5)', borderRadius:20, padding:'2px 8px', fontSize:11, color:'#FCA5A5' }}>❌ {vaxStatus.exp}</span>}
                {(pet.vaccines || []).length === 0 && <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>Sin registros</span>}
              </div>
            </div>
            {/* Microchip */}
            <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:12, padding:'10px 14px', minWidth:100 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <Cpu size={14} color="white" />
                <span style={{ fontFamily:'var(--font-sub)', fontSize:11, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:1 }}>Microchip</span>
              </div>
              {pet.hasMicrochip
                ? <span style={{ background:'rgba(16,185,129,0.3)', border:'1px solid rgba(16,185,129,0.5)', borderRadius:20, padding:'2px 8px', fontSize:11, color:'#6EE7B7' }}>✅ Registrado</span>
                : <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>No registrado</span>}
            </div>
            {/* Sterilized */}
            <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:12, padding:'10px 14px', minWidth:100 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <Scissors size={14} color="white" />
                <span style={{ fontFamily:'var(--font-sub)', fontSize:11, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:1 }}>Esterilizado</span>
              </div>
              {pet.sterilized
                ? <span style={{ background:'rgba(16,185,129,0.3)', border:'1px solid rgba(16,185,129,0.5)', borderRadius:20, padding:'2px 8px', fontSize:11, color:'#6EE7B7' }}>✅ Sí</span>
                : <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>No</span>}
            </div>
          </div>

          {/* Allergies */}
          {(pet.allergies || []).length > 0 && (
            <div>
              <p style={{ fontFamily:'var(--font-sub)', fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Alergias conocidas</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {pet.allergies.map((a,i) => (
                  <span key={i} style={{ background:'rgba(239,68,68,0.25)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:20, padding:'2px 10px', fontSize:11, color:'#FCA5A5' }}>
                    ⚠️ {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          {(pet.conditions || []).length > 0 && (
            <div>
              <p style={{ fontFamily:'var(--font-sub)', fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Condiciones médicas</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {pet.conditions.map((c,i) => (
                  <span key={i} style={{ background:'rgba(124,58,237,0.25)', border:'1px solid rgba(124,58,237,0.4)', borderRadius:20, padding:'2px 10px', fontSize:11, color:'#C4B5FD' }}>
                    {c.name} ({c.status})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Microchip number */}
          {pet.hasMicrochip && pet.microchipNum && (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:'auto' }}>
              CHIP: {pet.microchipNum}
            </div>
          )}
        </div>

        {/* Footer band */}
        <div style={{
          background:'linear-gradient(90deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))',
          padding:'10px 28px',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          borderTop:'1px solid rgba(255,255,255,0.1)',
          position:'relative', zIndex:10,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <ShieldCheck size={14} style={{ color: theme.primary }} />
            <span style={{ fontFamily:'var(--font-sub)', fontSize:11, color:'rgba(255,255,255,0.7)' }}>
              Emitido por PAWID · Portal Oficial de Mascotas
            </span>
          </div>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:1 }}>
            pawid.app
          </span>
        </div>
      </div>
    )
  }

  // FRONT SIDE
  return (
    <div style={{
      width:'100%', height:'100%',
      background: `linear-gradient(135deg, #1a0a3a 0%, #050B2C 40%, #0d1a3a 100%)`,
      position:'relative', overflow:'hidden',
      display:'flex', flexDirection:'column',
    }}>
      {/* Radial glow from pet theme */}
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 30% 50%, ${theme.glow} 0%, transparent 60%)` }} />

      {/* Cross-hatch pattern */}
      <svg style={{ position:'absolute', inset:0, opacity:0.04 }} width="100%" height="100%">
        <defs>
          <pattern id="gridPat" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridPat)" />
      </svg>

      {/* Holo overlay on right side */}
      <div style={{
        position:'absolute', top:0, right:0,
        width:'38%', height:'100%',
        background:'linear-gradient(135deg, rgba(255,183,3,0.12) 0%, rgba(255,107,0,0.08) 20%, rgba(255,45,140,0.10) 40%, rgba(138,43,226,0.08) 60%, rgba(58,134,255,0.10) 80%, rgba(255,183,3,0.08) 100%)',
        animation:'hologram 4s ease infinite',
      }} />

      {/* Top holographic strip */}
      <div className="holographic" style={{ height:6, width:'100%', flexShrink:0 }} />

      {/* Content */}
      <div style={{ position:'relative', zIndex:10, flex:1, padding:'14px 22px', display:'flex', flexDirection:'column' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{
            fontFamily:'var(--font-display)', fontWeight:900, fontSize:18,
            letterSpacing:3,
            background:'var(--grad-fire)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            🐾 PAWID
          </div>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,0.4)', textTransform:'uppercase' }}>
            CHILE · REGISTRO OFICIAL
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1, display:'flex', flexDirection: portrait ? 'column' : 'row', gap: portrait ? 10 : 16, alignItems: portrait ? 'center' : 'center' }}>
          {/* Photo */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0 }}>
            <div style={{
              width:106, height:106, borderRadius:'50%',
              background: pet.photo ? `url(${pet.photo}) center/cover no-repeat` : `linear-gradient(135deg, ${theme.glow}, rgba(138,43,226,0.3))`,
              border:`3px solid ${theme.primary}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:40, boxShadow:`0 0 24px ${theme.glow}`, flexShrink:0,
            }}>
              {!pet.photo && (SPECIES_EMOJI[pet.species] || '🐾')}
            </div>
            <div style={{ display:'flex', gap:4 }}>
              {pet.hasMicrochip && <span title="Microchip" style={{ fontSize:12 }}>💾</span>}
              {pet.sterilized && <span title="Esterilizado" style={{ fontSize:12 }}>✂️</span>}
              {(pet.vaccines||[]).some(v => v.nextDate && (new Date(v.nextDate) - new Date()) > 0) && <span title="Vacunas al día" style={{ fontSize:12 }}>💉</span>}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:3, overflow:'hidden', minWidth:0 }}>
            <div style={{
              fontFamily:'var(--font-display)', fontWeight:800,
              fontSize:'clamp(16px, 2.2vw, 24px)', lineHeight:1.1,
              background:'var(--grad-fire)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>
              {pet.name}
            </div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:11, color:'rgba(255,255,255,0.6)' }}>
              {SPECIES_LABELS[pet.species] || ''}{pet.breed ? ` · ${pet.breed}` : ''}
            </div>

            <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:2 }}>
              {[
                { label:'EDAD', value:calculateAge(pet.dob) },
                { label:'PESO', value:pet.weight ? `${pet.weight} kg` : '—' },
                { label:'SEXO', value:pet.sex || '—' },
                pet.hasMicrochip && { label:'CHIP', value:pet.microchipNum || 'Registrado' },
              ].filter(Boolean).map(({ label, value }) => (
                <div key={label} style={{ display:'flex', gap:8, alignItems:'baseline' }}>
                  <span style={{ fontSize:8, fontWeight:700, color:'rgba(255,255,255,0.38)', letterSpacing:1.5, width:30, flexShrink:0 }}>{label}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--cream)', fontWeight:400 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* PAWID Number box */}
            <div style={{ marginTop:10, background:'rgba(0,0,0,0.35)', borderRadius:8, padding:'6px 10px', border:'1px solid rgba(255,255,255,0.07)', display:'inline-block' }}>
              <div style={{ fontSize:7, letterSpacing:2, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:2 }}>Número PAWID</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'clamp(8px, 1.1vw, 12px)', fontWeight:700, color:'var(--gold)', letterSpacing:2 }}>
                {pet.pawid}
              </div>
            </div>

            {/* Status badges */}
            <div style={{ display:'flex', gap:5, marginTop:6, flexWrap:'wrap' }}>
              {(pet.vaccines||[]).some(v => v.nextDate && (new Date(v.nextDate) - new Date()) > 0) && (
                <span style={{ fontSize:8, fontWeight:700, padding:'2px 7px', borderRadius:100, background:'rgba(52,211,153,0.2)', color:'#34D399', border:'1px solid rgba(52,211,153,0.3)' }}>✓ Vacunado/a</span>
              )}
              {pet.hasMicrochip && (
                <span style={{ fontSize:8, fontWeight:700, padding:'2px 7px', borderRadius:100, background:'rgba(58,134,255,0.2)', color:'#3A86FF', border:'1px solid rgba(58,134,255,0.3)' }}>✓ Microchip</span>
              )}
              {pet.sterilized && (
                <span style={{ fontSize:8, fontWeight:700, padding:'2px 7px', borderRadius:100, background:'rgba(255,183,3,0.2)', color:'var(--gold)', border:'1px solid rgba(255,183,3,0.3)' }}>✓ Esterilizado/a</span>
              )}
            </div>

            {(pet.allergies||[]).length > 0 && (
              <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:4 }}>
                {pet.allergies.slice(0,2).map((a,i) => (
                  <span key={i} style={{ background:'rgba(239,68,68,0.25)', border:'1px solid rgba(239,68,68,0.35)', borderRadius:100, padding:'1px 7px', fontSize:8, color:'#FCA5A5' }}>⚠ {a}</span>
                ))}
              </div>
            )}
          </div>

          {/* QR */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, background:'white', borderRadius:10, padding:8, flexShrink:0, alignSelf:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.4)' }}>
            <QRCodeSVG value={qrValue} size={76} bgColor="white" fgColor="#050B2C" level="M" />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:7, color:'#374151', letterSpacing:0.3 }}>Escanear</span>
          </div>
        </div>
      </div>

      {/* Fire gradient stripe at bottom */}
      <div style={{
        background:'var(--grad-fire)',
        padding:'7px 22px',
        display:'flex', alignItems:'center',
        position:'relative', zIndex:10,
        flexShrink:0,
      }}>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:8, fontWeight:700,
          letterSpacing:2, color:'rgba(5,11,44,0.8)',
          textTransform:'uppercase', whiteSpace:'nowrap', overflow:'hidden',
        }}>
          PAWID · Portal Oficial de Mascotas · Amor · Responsabilidad · Familia · {pet.pawid}
        </span>
      </div>
    </div>
  )
}

// ─── Flipping card wrapper ────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return mobile
}

function FlippableCard({ pet, theme }) {
  const [flipped, setFlipped] = useState(false)
  const cardRef = useRef(null)
  const isMobile = useIsMobile()

  const handleDownload = async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null })
    const link = document.createElement('a')
    link.download = `cedula-${pet.name || 'mascota'}-PAWID.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // Portrait card for mobile: stacked layout
  const cardAspect = isMobile ? '9/14' : '856/540'

  return (
    <div className="print-card">
      {/* Flip container */}
      <div style={{ perspective: 1200, marginBottom: 16 }}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
          style={{
            transformStyle: 'preserve-3d', position: 'relative',
            width: isMobile ? '100%' : '100%',
            maxWidth: isMobile ? 360 : '100%',
            margin: isMobile ? '0 auto' : '0',
            aspectRatio: cardAspect,
          }}
        >
          {/* Front */}
          <div
            ref={cardRef}
            style={{
              position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden',
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${theme.glow}`,
            }}
          >
            <PetIDCard pet={pet} theme={theme} side="front" portrait={isMobile} />
          </div>
          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${theme.glow}`,
          }}>
            <PetIDCard pet={pet} theme={theme} side="back" portrait={isMobile} />
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginTop:4 }}>
        <button className="btn-primary no-print" onClick={handleDownload}>
          <Download size={16} /> Descargar
        </button>
        <button className="btn-ghost no-print" onClick={() => {
          navigator.clipboard?.writeText(`${window.location.origin}/perfil/${pet.pawid}`)
            .then(() => alert('¡Enlace copiado!'))
        }}>
          <Share2 size={16} /> Compartir
        </button>
        <button className="btn-ghost no-print" onClick={() => setFlipped(f => !f)}>
          <RotateCcw size={16} /> {flipped ? 'Ver frente' : 'Ver reverso'}
        </button>
        <button className="btn-ghost no-print" onClick={() => window.print()}>
          Imprimir
        </button>
      </div>
    </div>
  )
}

// ─── Fullscreen modal ─────────────────────────────────────────────────────────
function FullscreenModal({ pet, theme, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 32,
      }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
      >
        <X size={20} />
      </button>
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
        style={{ width: '100%', maxWidth: 856, aspectRatio: '856/540', borderRadius: 20, overflow: 'hidden', boxShadow: `0 0 100px ${theme.glow}` }}
        onClick={e => e.stopPropagation()}
      >
        <PetIDCard pet={pet} theme={theme} side="front" />
      </motion.div>
      <p style={{ fontFamily: 'var(--font-sub)', color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 13 }}>
        Modo Veterinaria — Presiona ESC para salir
      </p>
    </motion.div>
  )
}

// ─── Medical panel ────────────────────────────────────────────────────────────
function MedicalPanel({ pet }) {
  const [tab, setTab] = useState('vaccines')
  const vaccines = pet.vaccines || []
  const conditions = pet.conditions || []
  const procedures = pet.procedures || []
  const allergies = pet.allergies || []

  const vaccineStatus = (nextDate) => {
    if (!nextDate) return 'exp'
    const diff = new Date(nextDate) - new Date()
    if (diff < 0) return 'exp'
    if (diff < 1000 * 60 * 60 * 24 * 30) return 'warn'
    return 'ok'
  }

  return (
    <div className="glass-dark rounded-2xl p-6">
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--color-text)', marginBottom:16 }}>
        📋 Historial Médico
      </h3>
      <div style={{ borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', gap:0, marginBottom:16, overflowX:'auto' }}>
        {[
          { key:'vaccines', label:`💉 Vacunas (${vaccines.length})` },
          { key:'conditions', label:`🏥 Condiciones (${conditions.length})` },
          { key:'procedures', label:`⚕️ Procedimientos (${procedures.length})` },
          { key:'allergies', label:`⚠️ Alergias (${allergies.length})` },
        ].map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          {tab === 'vaccines' && (
            vaccines.length === 0
              ? <p style={{ fontFamily:'var(--font-body)', color:'var(--color-muted)', fontSize:14 }}>No hay vacunas registradas.</p>
              : <div className="space-y-3">
                  {vaccines.map(v => {
                    const st = vaccineStatus(v.nextDate)
                    return (
                      <div key={v.id} className="glass rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p style={{ fontFamily:'var(--font-sub)', fontWeight:600, fontSize:15, color:'var(--color-text)' }}>{v.name || 'Sin nombre'}</p>
                            {v.vet && <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--color-muted)' }}>📍 {v.vet}</p>}
                            <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--color-muted)', marginTop:4 }}>
                              Aplicación: {v.date || '—'} · Próxima: {v.nextDate || '—'}
                            </p>
                          </div>
                          <span className={`tag tag-vaccine-${st}`}>
                            {st==='ok' ? '✅ Al día' : st==='warn' ? '⚠️ Próxima' : '❌ Vencida'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
          )}
          {tab === 'conditions' && (
            conditions.length === 0
              ? <p style={{ fontFamily:'var(--font-body)', color:'var(--color-muted)', fontSize:14 }}>Sin condiciones registradas.</p>
              : <div className="space-y-3">
                  {conditions.map(c => (
                    <div key={c.id} className="glass rounded-xl p-4">
                      <div className="flex justify-between">
                        <p style={{ fontFamily:'var(--font-sub)', fontWeight:600, fontSize:15, color:'var(--color-text)' }}>{c.name}</p>
                        <span className="tag" style={{ background: c.status==='resuelta'?'rgba(16,185,129,0.2)':c.status==='controlada'?'rgba(245,158,11,0.2)':'rgba(239,68,68,0.2)', border:'1px solid currentColor', color: c.status==='resuelta'?'#6EE7B7':c.status==='controlada'?'#FCD34D':'#FCA5A5' }}>
                          {c.status}
                        </span>
                      </div>
                      {c.treatment && <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--color-muted)', marginTop:4 }}>Tratamiento: {c.treatment}</p>}
                    </div>
                  ))}
                </div>
          )}
          {tab === 'procedures' && (
            procedures.length === 0
              ? <p style={{ fontFamily:'var(--font-body)', color:'var(--color-muted)', fontSize:14 }}>Sin procedimientos registrados.</p>
              : <div className="space-y-3">
                  {procedures.map(p => (
                    <div key={p.id} className="glass rounded-xl p-4">
                      <p style={{ fontFamily:'var(--font-sub)', fontWeight:600, fontSize:15, color:'var(--color-text)' }}>{p.name}</p>
                      <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--color-muted)', marginTop:2 }}>{p.clinic}{p.date ? ` · ${p.date}` : ''}</p>
                      {p.notes && <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--color-muted)', marginTop:4 }}>📝 {p.notes}</p>}
                    </div>
                  ))}
                </div>
          )}
          {tab === 'allergies' && (
            allergies.length === 0
              ? <p style={{ fontFamily:'var(--font-body)', color:'var(--color-muted)', fontSize:14 }}>Sin alergias registradas.</p>
              : <div className="flex flex-wrap gap-2">
                  {allergies.map((a,i) => (
                    <span key={i} className="tag tag-allergy"><AlertCircle size={11} /> {a}</span>
                  ))}
                </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Public profile page (QR target) ─────────────────────────────────────────
export function PublicProfilePage() {
  const { pawid } = useParams()
  const { pets } = usePets()
  const pet = pets.find(p => p.pawid === pawid)
  const theme = usePetTheme(pet?.species)

  useEffect(() => { if (pet) theme.apply() }, [pet?.species])

  if (!pet) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <span style={{ fontSize:64 }}>🔍</span>
      <p style={{ fontFamily:'var(--font-sub)', fontSize:18, color:'var(--color-muted)' }}>Perfil no encontrado</p>
      <p style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--color-muted)', fontFamily:'var(--font-mono)' }}>{pawid}</p>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, paddingBottom:60, background:'var(--color-bg)' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', background:`radial-gradient(ellipse at 50% 30%, ${theme.glow} 0%, transparent 60%)` }} />
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ textAlign:'center', marginBottom:32 }}>
          <span style={{ fontFamily:'var(--font-sub)', fontSize:13, color:'var(--color-muted)' }}>Perfil público verificado por</span>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:28, color:'var(--color-text)' }}>PAWID</div>
        </motion.div>
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} style={{ width:'100%', aspectRatio:'856/540', borderRadius:20, overflow:'hidden', boxShadow:`0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${theme.glow}` }}>
          <PetIDCard pet={pet} theme={theme} side="front" />
        </motion.div>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }} style={{ marginTop:32 }}>
          <MedicalPanel pet={pet} />
        </motion.div>
      </div>
    </div>
  )
}

// ─── Main CedulaPage ──────────────────────────────────────────────────────────
export default function CedulaPage() {
  const { id } = useParams()
  const { pets, activePetId, setActivePetId } = usePets()
  const navigate = useNavigate()
  const [fullscreen, setFullscreen] = useState(false)

  const pet = id
    ? pets.find(p => p.id === id)
    : pets.find(p => p.id === activePetId) || pets[0]

  useEffect(() => { if (pet) setActivePetId(pet.id) }, [pet?.id])

  const theme = usePetTheme(pet?.species)
  useEffect(() => { if (pet?.species) theme.apply() }, [pet?.species])

  if (!pet) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
        <span style={{ fontSize:64 }}>🐾</span>
        <p style={{ fontFamily:'var(--font-sub)', fontSize:18, color:'var(--color-muted)' }}>No tienes mascotas registradas aún.</p>
        <button className="btn-primary" onClick={() => navigate('/crear')}>
          <Plus size={16} /> Crear mi primera mascota
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', paddingTop:100, paddingBottom:80, background:'var(--color-bg)' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, background:`radial-gradient(ellipse at 50% 30%, ${theme.glow} 0%, transparent 60%)` }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button className="btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ChevronLeft size={16} /> Volver
          </button>
          <div className="flex gap-3">
            <button className="btn-ghost btn-sm" onClick={() => setFullscreen(true)} title="Modo veterinaria">
              <Maximize2 size={14} /> Veterinaria
            </button>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/crear')}>
              <Edit3 size={14} /> Editar
            </button>
          </div>
        </div>

        {/* Pet selector */}
        {pets.length > 1 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {pets.map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/cedula/${p.id}`)}
                className="glass rounded-full px-4 py-2 flex items-center gap-2 whitespace-nowrap transition-all"
                style={{
                  fontFamily:'var(--font-sub)', fontSize:14,
                  border: p.id === pet.id ? '1px solid var(--pet-primary)' : '1px solid rgba(255,255,255,0.1)',
                  background: p.id === pet.id ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                  color:'var(--color-text)',
                }}
              >
                <span>{SPECIES_EMOJI[p.species] || '🐾'}</span>
                {p.name}
              </button>
            ))}
            <button className="btn-ghost btn-sm rounded-full" onClick={() => navigate('/crear')}>
              <Plus size={14} /> Nueva mascota
            </button>
          </div>
        )}

        {/* Card with flip */}
        <motion.div initial={{ opacity:0, y:30, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:0.6 }} className="mb-10">
          <FlippableCard pet={pet} theme={theme} />
        </motion.div>

        {/* Medical history */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <MedicalPanel pet={pet} />
        </motion.div>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {fullscreen && <FullscreenModal pet={pet} theme={theme} onClose={() => setFullscreen(false)} />}
      </AnimatePresence>
    </div>
  )
}
