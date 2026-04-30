const initSqlJs = require('sql.js')
const path     = require('path')
const fs       = require('fs')

const DB_PATH = path.join(__dirname, '..', 'pawid.db')
let _rawDb          = null  // sql.js Database instance
let _wrapper        = null  // better-sqlite3-compatible wrapper
let _inTransaction  = false // guard: don't save mid-transaction

// ── Persist in-memory DB to disk ─────────────────────────────────────────────
function save() {
  if (_inTransaction) return   // defer until COMMIT
  const data = _rawDb.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

// ── Wrap a SQL statement to mimic better-sqlite3 PreparedStatement ─────────
function wrapStmt(sql) {
  return {
    run(...args) {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args
      _rawDb.run(sql, params)
      save()
      return { changes: _rawDb.getRowsModified() }
    },
    get(...args) {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args
      const stmt = _rawDb.prepare(sql)
      stmt.bind(params)
      const row = stmt.step() ? stmt.getAsObject() : null
      stmt.free()
      return row
    },
    all(...args) {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args
      const stmt = _rawDb.prepare(sql)
      stmt.bind(params)
      const rows = []
      while (stmt.step()) rows.push(stmt.getAsObject())
      stmt.free()
      return rows
    },
  }
}

// ── better-sqlite3-compatible wrapper ────────────────────────────────────────
function createWrapper() {
  return {
    prepare: (sql) => wrapStmt(sql),

    exec(sql) {
      _rawDb.run(sql)
      save()
    },

    // Mimics db.transaction(fn) → returns a function that wraps fn in a transaction
    transaction(fn) {
      return (...args) => {
        _inTransaction = true
        _rawDb.run('BEGIN')
        try {
          fn(...args)
          _rawDb.run('COMMIT')
          _inTransaction = false
          save()
        } catch (err) {
          _inTransaction = false
          try { _rawDb.run('ROLLBACK') } catch (_) {}
          throw err
        }
      }
    },

    // Convenience: execute without saving (used internally during initDb)
    _exec(sql) { _rawDb.run(sql) },
  }
}

// ── Initialize DB: load from file or create fresh ────────────────────────────
async function initDb() {
  const SQL = await initSqlJs()

  if (fs.existsSync(DB_PATH)) {
    _rawDb = new SQL.Database(fs.readFileSync(DB_PATH))
  } else {
    _rawDb = new SQL.Database()
  }

  _wrapper = createWrapper()

  // Schema (CREATE TABLE IF NOT EXISTS — idempotent)
  _rawDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT UNIQUE,
      password_hash TEXT,
      name          TEXT NOT NULL,
      avatar        TEXT,
      provider      TEXT NOT NULL DEFAULT 'local',
      provider_id   TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pets (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES users(id),
      pawid         TEXT UNIQUE NOT NULL,
      name          TEXT NOT NULL,
      species       TEXT NOT NULL,
      breed         TEXT,
      color         TEXT,
      sex           TEXT,
      dob           TEXT,
      weight        REAL,
      height        REAL,
      has_microchip INTEGER NOT NULL DEFAULT 0,
      microchip_num TEXT,
      sterilized    INTEGER NOT NULL DEFAULT 0,
      photo         TEXT,
      physio_traits TEXT NOT NULL DEFAULT '[]',
      is_active     INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vaccines (
      id           TEXT PRIMARY KEY,
      pet_id       TEXT NOT NULL REFERENCES pets(id),
      name         TEXT NOT NULL,
      applied_date TEXT,
      next_date    TEXT,
      vet_name     TEXT,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS conditions (
      id         TEXT PRIMARY KEY,
      pet_id     TEXT NOT NULL REFERENCES pets(id),
      name       TEXT NOT NULL,
      diag_date  TEXT,
      status     TEXT NOT NULL DEFAULT 'activa',
      treatment  TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS procedures (
      id         TEXT PRIMARY KEY,
      pet_id     TEXT NOT NULL REFERENCES pets(id),
      name       TEXT NOT NULL,
      proc_date  TEXT,
      clinic     TEXT,
      notes      TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS allergies (
      id     TEXT PRIMARY KEY,
      pet_id TEXT NOT NULL REFERENCES pets(id),
      name   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS weight_history (
      id          TEXT PRIMARY KEY,
      pet_id      TEXT NOT NULL REFERENCES pets(id),
      weight      REAL NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vet_consultations (
      id         TEXT PRIMARY KEY,
      pet_id     TEXT NOT NULL REFERENCES pets(id),
      user_id    TEXT NOT NULL REFERENCES users(id),
      question   TEXT NOT NULL,
      response   TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_pets_user_id      ON pets(user_id);
    CREATE INDEX IF NOT EXISTS idx_pets_pawid        ON pets(pawid);
    CREATE INDEX IF NOT EXISTS idx_vaccines_pet_id   ON vaccines(pet_id);
    CREATE INDEX IF NOT EXISTS idx_conditions_pet_id ON conditions(pet_id);
    CREATE INDEX IF NOT EXISTS idx_procedures_pet_id ON procedures(pet_id);
    CREATE INDEX IF NOT EXISTS idx_allergies_pet_id  ON allergies(pet_id);
    CREATE INDEX IF NOT EXISTS idx_weight_pet_id     ON weight_history(pet_id);
    CREATE INDEX IF NOT EXISTS idx_users_provider    ON users(provider, provider_id);
  `)

  save() // persist schema to disk
  console.log('✅ Base de datos inicializada →', DB_PATH)
}

function getDb() {
  if (!_wrapper) throw new Error('DB no inicializada. Llama initDb() primero.')
  return _wrapper
}

module.exports = { getDb, initDb }
