import React from 'react'
import { api } from '../../api'
import Page from '../../components/Page'
import { Grid, Card, CardContent, Typography } from '@mui/material'

export default function StudentCirculars(){
  const [items, setItems] = React.useState([])
  const load = async () => { const r = await api.get('/api/circulars'); setItems(r.data) }
  React.useEffect(()=>{ load() },[])
  return (
    <Page title="Circulars">
      <Grid container spacing={2}>
        {items.map(c => (
          <Grid item xs={12} md={6} key={c.id}>
            <Card variant="outlined"><CardContent>
              <Typography variant="subtitle1">{c.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>{new Date(c.publish_at || c.created_at || Date.now()).toLocaleString()}</Typography>
              <Typography variant="body2" sx={{ mt:1 }}>{c.body?.slice(0,160)}{c.body && c.body.length>160?'...':''}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>
    </Page>
  )
}
