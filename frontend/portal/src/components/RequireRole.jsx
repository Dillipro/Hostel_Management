import React from 'react'
import { Navigate } from 'react-router-dom'
import { getRole } from '../utils/auth'

export default function RequireRole({ allow = [], children }) {
  const role = getRole()
  if (!role) return <Navigate to="/login" replace />
  if (allow.length && !allow.includes(role)) return <Navigate to="/" replace />
  return children
}
