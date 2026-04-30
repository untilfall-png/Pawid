// Token store — actualizado por AuthContext, leído por cada request
const tokenStore = {
  _token: null,
  set(t)  { this._token = t },
  get()   { return this._token },
  clear() { this._token = null },
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = tokenStore.get()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let errMsg = 'Error desconocido'
    try {
      const data = await res.json()
      errMsg = data.error || errMsg
    } catch {}
    const err = new Error(errMsg)
    err.status = res.status
    throw err
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
}

export { tokenStore }
export default api
