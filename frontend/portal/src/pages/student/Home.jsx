import React from 'react'
import { api } from '../../api'
import Dashboard from './components/Dashboard'

export default function StudentHome(){
  const [me, setMe] = React.useState(null)
  React.useEffect(()=>{ api.get('/api/students/me').then(r=>setMe(r.data)) },[])
  if (!me) return null
  return <Dashboard me={me} />
}
