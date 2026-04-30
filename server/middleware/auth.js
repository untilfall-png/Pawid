const jwt = require('jsonwebtoken')
const { getDb } = require('../db/database')

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de acceso requerido.' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const db = getDb()
    const user = db.prepare(
      'SELECT id, name, email, avatar, provider, created_at FROM users WHERE id = ?'
    ).get(payload.sub)

    if (!user) return res.status(401).json({ error: 'Usuario no encontrado.' })

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado.', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'Token inválido.' })
  }
}

module.exports = { authMiddleware }
