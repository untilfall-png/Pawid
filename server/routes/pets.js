const router = require('express').Router()
const { v4: uuidv4 } = require('uuid')
const { getDb } = require('../db/database')
const { authMiddleware } = require('../middleware/auth')

// ── Helpers ──────────────────────────────────────────────────────────────────

const SPECIES_CODE = {
  dog: 'DOG', cat: 'CAT', rabbit: 'RAB', bird: 'BRD',
  reptile: 'REP', fish: 'FSH', hamster: 'HMS', other: 'PET',
}

function generatePawId(species) {
  const code = SPECIES_CODE[species] || 'PET'
  const year = new Date().getFullYear()
  const uid = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 8)
  return `PAW-${code}-${year}-${uid}`
}

function parsePet(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    pawid: row.pawid,
    name: row.name,
    species: row.species,
    breed: row.breed,
    color: row.color,
    sex: row.sex,
    dob: row.dob,
    weight: row.weight,
    height: row.height,
    hasMicrochip: Boolean(row.has_microchip),
    microchipNum: row.microchip_num,
    sterilized: Boolean(row.sterilized),
    photo: row.photo,
    physio: JSON.parse(row.physio_traits || '[]'),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function parseVaccine(row) {
  return { id: row.id, name: row.name, date: row.applied_date, nextDate: row.next_date, vet: row.vet_name, createdAt: row.created_at }
}

function parseCondition(row) {
  return { id: row.id, name: row.name, diagDate: row.diag_date, status: row.status, treatment: row.treatment, createdAt: row.created_at }
}

function parseProcedure(row) {
  return { id: row.id, name: row.name, date: row.proc_date, clinic: row.clinic, notes: row.notes, createdAt: row.created_at }
}

function withMedical(db, petId, pet) {
  pet.vaccines   = db.prepare('SELECT * FROM vaccines   WHERE pet_id = ? ORDER BY applied_date DESC').all(petId).map(parseVaccine)
  pet.conditions = db.prepare('SELECT * FROM conditions WHERE pet_id = ? ORDER BY diag_date   DESC').all(petId).map(parseCondition)
  pet.procedures = db.prepare('SELECT * FROM procedures WHERE pet_id = ? ORDER BY proc_date   DESC').all(petId).map(parseProcedure)
  pet.allergies  = db.prepare('SELECT name FROM allergies WHERE pet_id = ?').all(petId).map(r => r.name)
  pet.weightHistory = db.prepare('SELECT weight, recorded_at as date FROM weight_history WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT 12').all(petId)
  return pet
}

function ownsPet(db, petId, userId) {
  return db.prepare('SELECT id FROM pets WHERE id = ? AND user_id = ?').get(petId, userId)
}

// ── GET /api/pets ────────────────────────────────────────────────────────────
router.get('/', authMiddleware, (req, res) => {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM pets WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)
  res.json(rows.map(parsePet))
})

// ── POST /api/pets ───────────────────────────────────────────────────────────
router.post('/', authMiddleware, (req, res) => {
  const db = getDb()
  const {
    name, species, breed, color, sex, dob,
    weight, height, hasMicrochip, microchipNum, sterilized,
    photo, physio,
    vaccines = [], conditions = [], procedures = [], allergies = [],
  } = req.body

  if (!name?.trim() || !species) {
    return res.status(400).json({ error: 'Nombre y especie son requeridos.' })
  }

  const id    = uuidv4()
  const pawid = generatePawId(species)

  const insertAll = db.transaction(() => {
    db.prepare(`
      INSERT INTO pets
        (id, user_id, pawid, name, species, breed, color, sex, dob,
         weight, height, has_microchip, microchip_num, sterilized, photo, physio_traits)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.user.id, pawid,
      name.trim(), species, breed || null, color || null, sex || null, dob || null,
      weight ? parseFloat(weight) : null,
      height ? parseFloat(height) : null,
      hasMicrochip ? 1 : 0,
      microchipNum || null,
      sterilized ? 1 : 0,
      photo || null,
      JSON.stringify(physio || []),
    )

    const stmtVax = db.prepare(
      'INSERT INTO vaccines (id, pet_id, name, applied_date, next_date, vet_name) VALUES (?, ?, ?, ?, ?, ?)'
    )
    vaccines.forEach(v => stmtVax.run(uuidv4(), id, v.name, v.date || null, v.nextDate || null, v.vet || null))

    const stmtCond = db.prepare(
      "INSERT INTO conditions (id, pet_id, name, diag_date, status, treatment) VALUES (?, ?, ?, ?, ?, ?)"
    )
    conditions.forEach(c => stmtCond.run(uuidv4(), id, c.name, c.diagDate || null, c.status || 'activa', c.treatment || null))

    const stmtProc = db.prepare(
      'INSERT INTO procedures (id, pet_id, name, proc_date, clinic, notes) VALUES (?, ?, ?, ?, ?, ?)'
    )
    procedures.forEach(p => stmtProc.run(uuidv4(), id, p.name, p.date || null, p.clinic || null, p.notes || null))

    const stmtAlg = db.prepare('INSERT INTO allergies (id, pet_id, name) VALUES (?, ?, ?)')
    allergies.forEach(a => stmtAlg.run(uuidv4(), id, typeof a === 'string' ? a : a.name))

    if (weight) {
      db.prepare('INSERT INTO weight_history (id, pet_id, weight) VALUES (?, ?, ?)').run(uuidv4(), id, parseFloat(weight))
    }
  })

  insertAll()

  const pet = parsePet(db.prepare('SELECT * FROM pets WHERE id = ?').get(id))
  res.status(201).json(withMedical(db, id, pet))
})

// ── GET /api/pets/public/:pawid — perfil público (sin auth) ─────────────────
router.get('/public/:pawid', (req, res) => {
  const db = getDb()
  const row = db.prepare('SELECT * FROM pets WHERE pawid = ?').get(req.params.pawid)
  if (!row) return res.status(404).json({ error: 'Perfil no encontrado.' })

  const pet = parsePet(row)
  const pub = {
    id: pet.id, pawid: pet.pawid, name: pet.name, species: pet.species,
    breed: pet.breed, color: pet.color, sex: pet.sex, dob: pet.dob,
    photo: pet.photo, physio: pet.physio, sterilized: pet.sterilized,
    hasMicrochip: pet.hasMicrochip, createdAt: pet.createdAt,
    vaccines:  db.prepare('SELECT name, applied_date, next_date FROM vaccines WHERE pet_id = ?').all(row.id).map(v => ({ name: v.name, date: v.applied_date, nextDate: v.next_date })),
    allergies: db.prepare('SELECT name FROM allergies WHERE pet_id = ?').all(row.id).map(r => r.name),
  }
  res.json(pub)
})

// ── GET /api/pets/:id ────────────────────────────────────────────────────────
router.get('/:id', authMiddleware, (req, res) => {
  const db = getDb()
  const row = db.prepare('SELECT * FROM pets WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!row) return res.status(404).json({ error: 'Mascota no encontrada.' })

  const pet = parsePet(row)
  res.json(withMedical(db, row.id, pet))
})

// ── PUT /api/pets/:id ────────────────────────────────────────────────────────
router.put('/:id', authMiddleware, (req, res) => {
  const db = getDb()
  if (!ownsPet(db, req.params.id, req.user.id)) {
    return res.status(404).json({ error: 'Mascota no encontrada.' })
  }

  const {
    name, species, breed, color, sex, dob,
    weight, height, hasMicrochip, microchipNum, sterilized, photo, physio,
  } = req.body

  db.prepare(`
    UPDATE pets SET
      name          = COALESCE(?, name),
      species       = COALESCE(?, species),
      breed         = COALESCE(?, breed),
      color         = COALESCE(?, color),
      sex           = COALESCE(?, sex),
      dob           = COALESCE(?, dob),
      weight        = COALESCE(?, weight),
      height        = COALESCE(?, height),
      has_microchip = COALESCE(?, has_microchip),
      microchip_num = COALESCE(?, microchip_num),
      sterilized    = COALESCE(?, sterilized),
      photo         = COALESCE(?, photo),
      physio_traits = COALESCE(?, physio_traits),
      updated_at    = datetime('now')
    WHERE id = ?
  `).run(
    name || null, species || null, breed !== undefined ? breed : null,
    color !== undefined ? color : null, sex !== undefined ? sex : null,
    dob !== undefined ? dob : null,
    weight !== undefined ? parseFloat(weight) : null,
    height !== undefined ? parseFloat(height) : null,
    hasMicrochip !== undefined ? (hasMicrochip ? 1 : 0) : null,
    microchipNum !== undefined ? microchipNum : null,
    sterilized !== undefined ? (sterilized ? 1 : 0) : null,
    photo !== undefined ? photo : null,
    physio !== undefined ? JSON.stringify(physio) : null,
    req.params.id,
  )

  if (weight) {
    db.prepare('INSERT INTO weight_history (id, pet_id, weight) VALUES (?, ?, ?)').run(uuidv4(), req.params.id, parseFloat(weight))
    db.prepare("UPDATE pets SET weight = ?, updated_at = datetime('now') WHERE id = ?").run(parseFloat(weight), req.params.id)
  }

  const pet = parsePet(db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id))
  res.json(withMedical(db, req.params.id, pet))
})

// ── DELETE /api/pets/:id ─────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb()
  if (!ownsPet(db, req.params.id, req.user.id)) {
    return res.status(404).json({ error: 'Mascota no encontrada.' })
  }
  const pid = req.params.id
  const cascade = db.transaction(() => {
    db.prepare('DELETE FROM vaccines          WHERE pet_id = ?').run(pid)
    db.prepare('DELETE FROM conditions        WHERE pet_id = ?').run(pid)
    db.prepare('DELETE FROM procedures        WHERE pet_id = ?').run(pid)
    db.prepare('DELETE FROM allergies         WHERE pet_id = ?').run(pid)
    db.prepare('DELETE FROM weight_history    WHERE pet_id = ?').run(pid)
    db.prepare('DELETE FROM vet_consultations WHERE pet_id = ?').run(pid)
    db.prepare('DELETE FROM pets              WHERE id     = ?').run(pid)
  })
  cascade()
  res.json({ message: 'Mascota eliminada.' })
})

// ── POST /api/pets/:petId/vaccines ───────────────────────────────────────────
router.post('/:petId/vaccines', authMiddleware, (req, res) => {
  const db = getDb()
  if (!ownsPet(db, req.params.petId, req.user.id)) {
    return res.status(404).json({ error: 'Mascota no encontrada.' })
  }
  const { name, date, nextDate, vet } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Nombre de vacuna requerido.' })

  const id = uuidv4()
  db.prepare('INSERT INTO vaccines (id, pet_id, name, applied_date, next_date, vet_name) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.params.petId, name.trim(), date || null, nextDate || null, vet || null)

  res.status(201).json(parseVaccine(db.prepare('SELECT * FROM vaccines WHERE id = ?').get(id)))
})

// ── DELETE /api/pets/:petId/vaccines/:id ─────────────────────────────────────
router.delete('/:petId/vaccines/:id', authMiddleware, (req, res) => {
  const db = getDb()
  const vax = db.prepare(
    'SELECT v.id FROM vaccines v JOIN pets p ON p.id = v.pet_id WHERE v.id = ? AND p.user_id = ?'
  ).get(req.params.id, req.user.id)

  if (!vax) return res.status(404).json({ error: 'Vacuna no encontrada.' })
  db.prepare('DELETE FROM vaccines WHERE id = ?').run(req.params.id)
  res.json({ message: 'Vacuna eliminada.' })
})

// ── POST /api/pets/:petId/weight ─────────────────────────────────────────────
router.post('/:petId/weight', authMiddleware, (req, res) => {
  const db = getDb()
  if (!ownsPet(db, req.params.petId, req.user.id)) {
    return res.status(404).json({ error: 'Mascota no encontrada.' })
  }
  const weight = parseFloat(req.body.weight)
  if (isNaN(weight) || weight <= 0) return res.status(400).json({ error: 'Peso válido requerido.' })

  const id = uuidv4()
  db.prepare('INSERT INTO weight_history (id, pet_id, weight) VALUES (?, ?, ?)').run(id, req.params.petId, weight)
  db.prepare("UPDATE pets SET weight = ?, updated_at = datetime('now') WHERE id = ?").run(weight, req.params.petId)

  const row = db.prepare('SELECT * FROM weight_history WHERE id = ?').get(id)
  res.status(201).json({ id: row.id, petId: row.pet_id, weight: row.weight, recordedAt: row.recorded_at })
})

// ── GET /api/pets/:petId/consultations ───────────────────────────────────────
router.get('/:petId/consultations', authMiddleware, (req, res) => {
  const db = getDb()
  if (!ownsPet(db, req.params.petId, req.user.id)) {
    return res.status(404).json({ error: 'Mascota no encontrada.' })
  }
  const rows = db.prepare(
    'SELECT * FROM vet_consultations WHERE pet_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.params.petId)
  res.json(rows)
})

// ── POST /api/pets/:petId/consultations ──────────────────────────────────────
router.post('/:petId/consultations', authMiddleware, (req, res) => {
  const db = getDb()
  if (!ownsPet(db, req.params.petId, req.user.id)) {
    return res.status(404).json({ error: 'Mascota no encontrada.' })
  }
  const { question, response } = req.body
  if (!question?.trim()) return res.status(400).json({ error: 'Pregunta requerida.' })

  const id = uuidv4()
  db.prepare(
    'INSERT INTO vet_consultations (id, pet_id, user_id, question, response) VALUES (?, ?, ?, ?, ?)'
  ).run(id, req.params.petId, req.user.id, question.trim(), response || null)

  res.status(201).json(db.prepare('SELECT * FROM vet_consultations WHERE id = ?').get(id))
})

module.exports = router
