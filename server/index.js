require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const passport = require('passport')
const { initDb } = require('./db/database')

require('./config/passport')

const app = express()

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }))

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:4173',
  ],
  credentials: true,
}))

app.use(express.json({ limit: '15mb' })) // 15 MB para fotos en base64
app.use(express.urlencoded({ extended: true }))

// ── Rate limiting en auth ────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 30,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/auth/login',    authLimiter)
app.use('/api/auth/register', authLimiter)

// ── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize())

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/pets', require('./routes/pets'))

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada.` })
})

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message, err.stack?.split('\n')[1])
  const isProd = process.env.NODE_ENV === 'production'
  res.status(err.status || 500).json({
    error: 'Error interno del servidor.',
    ...(isProd ? {} : { detail: err.message }),
  })
})

// ── Arranque async (sql.js necesita inicializar WASM primero) ─────────────────
const PORT = process.env.PORT || 3001;

(async () => {
  try {
    await initDb()
    app.listen(PORT, () => {
      console.log(`🚀 Pawid API → http://localhost:${PORT}`)
      console.log(`📋 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ No configurado'}`)
      console.log(`📋 GitHub OAuth: ${process.env.GITHUB_CLIENT_ID ? '✅ Configurado' : '❌ No configurado'}`)
    })
  } catch (err) {
    console.error('❌ Error al iniciar servidor:', err)
    process.exit(1)
  }
})()
