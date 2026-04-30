const passport = require('passport')
const { v4: uuidv4 } = require('uuid')
const { getDb } = require('../db/database')

function findOrCreateOAuthUser(provider, profileId, email, name, avatar) {
  const db = getDb()

  let user = db.prepare(
    'SELECT * FROM users WHERE provider = ? AND provider_id = ?'
  ).get(provider, profileId)

  if (!user) {
    const emailUser = email
      ? db.prepare('SELECT * FROM users WHERE email = ?').get(email)
      : null

    if (emailUser) {
      db.prepare(
        'UPDATE users SET provider = ?, provider_id = ?, avatar = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).run(provider, profileId, avatar || emailUser.avatar, emailUser.id)
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(emailUser.id)
    } else {
      const id = uuidv4()
      const safeEmail = email || `${provider}_${profileId}@pawid.local`
      db.prepare(
        'INSERT INTO users (id, email, name, avatar, provider, provider_id) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(id, safeEmail, name, avatar, provider, profileId)
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    }
  }

  return user
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:3001'}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const avatar = profile.photos?.[0]?.value
        const user = findOrCreateOAuthUser('google', profile.id, email, profile.displayName, avatar)
        done(null, user)
      } catch (err) {
        done(err)
      }
    }
  ))
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const GitHubStrategy = require('passport-github2').Strategy
  passport.use(new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:3001'}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.find(e => e.primary)?.value || profile.emails?.[0]?.value
        const avatar = profile.photos?.[0]?.value
        const name = profile.displayName || profile.username
        const user = findOrCreateOAuthUser('github', String(profile.id), email, name, avatar)
        done(null, user)
      } catch (err) {
        done(err)
      }
    }
  ))
}

module.exports = passport
