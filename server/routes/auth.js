const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const passport = require('passport')
const { getDb } = require('../db/database')
const { authMiddleware } = require('../middleware/auth')

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const JWT_EXPIRES = '7d'

function issueToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

function safeUser(user) {
  const { password_hash, provider_id, ...safe } = user
  return safe
}

function userHasPets(userId) {
  const db = getDb()
  const row = db.prepare('SELECT COUNT(*) as n FROM pets WHERE user_id = ?').get(userId)
  return row.n > 0
}

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' })
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      return res.status(400).json({ error: 'Email inválido.' })
    }

    const db = getDb()
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
    if (existing) {
      return res.status(409).json({ error: 'Este email ya está registrado.' })
    }

    const hash = await bcrypt.hash(password, 12)
    const id = uuidv4()

    db.prepare(
      "INSERT INTO users (id, email, password_hash, name, provider) VALUES (?, ?, ?, ?, 'local')"
    ).run(id, email.toLowerCase().trim(), hash, name.trim())

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    const token = issueToken(id)

    res.status(201).json({ token, user: safeUser(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al registrar usuario.' })
  }
})

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos.' })
    }

    const db = getDb()
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim())

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Credenciales inválidas.' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' })
    }

    const token = issueToken(user.id)
    res.json({ token, user: safeUser(user), hasPets: userHasPets(user.id) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al iniciar sesión.' })
  }
})

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Sesión cerrada.' })
})

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user, hasPets: userHasPets(req.user.id) })
})

// ── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.redirect(`${FRONTEND_URL}/login?error=oauth_not_configured`)
  }
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })(req, res, next)
})

router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${FRONTEND_URL}/login?error=google_failed`,
    })(req, res, next)
  },
  (req, res) => {
    const token = issueToken(req.user.id)
    const isNew = !userHasPets(req.user.id)
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&isNew=${isNew}`)
  }
)

// ── GitHub OAuth ─────────────────────────────────────────────────────────────
router.get('/github', (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    return res.redirect(`${FRONTEND_URL}/login?error=oauth_not_configured`)
  }
  passport.authenticate('github', { session: false, scope: ['user:email'] })(req, res, next)
})

router.get('/github/callback',
  (req, res, next) => {
    passport.authenticate('github', {
      session: false,
      failureRedirect: `${FRONTEND_URL}/login?error=github_failed`,
    })(req, res, next)
  },
  (req, res) => {
    const token = issueToken(req.user.id)
    const isNew = !userHasPets(req.user.id)
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&isNew=${isNew}`)
  }
)

module.exports = router
