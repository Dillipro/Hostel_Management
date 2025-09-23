export function getToken() {
  return localStorage.getItem('access') || ''
}

export function getRole() {
  try {
    const token = getToken()
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role || null
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return !!getToken()
}

export function roleHome(role) {
  if (role === 'admin') return '/admin'
  if (role === 'warden') return '/warden'
  if (role === 'rc') return '/rc'
  return '/student'
}
