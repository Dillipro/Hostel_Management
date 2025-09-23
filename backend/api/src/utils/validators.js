function isStrongPassword(pw) {
  const s = String(pw || '')
  if (s.length < 8) return false
  const hasLetter = /[A-Za-z]/.test(s)
  const hasNumber = /\d/.test(s)
  return hasLetter && hasNumber
}

module.exports = { isStrongPassword }
