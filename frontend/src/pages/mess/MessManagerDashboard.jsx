import React from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import {
  ShoppingCartIcon,
  FireIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'

const Shell = styled.div`
  min-height: 100vh;
  background: radial-gradient(1000px 600px at -10% 0%, rgba(16,185,129,0.12), transparent),
              radial-gradient(1000px 600px at 110% 100%, rgba(236,72,153,0.12), transparent),
              #0b1220;
  color: #e5e7eb;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`

const Card = styled(motion.div)`
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid rgba(236,72,153,0.25);
  border-radius: 18px;
  padding: 20px;
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 40px rgba(0,0,0,0.25);
`

const Stat = styled(Card)`
  grid-column: span 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StatLabel = styled.div`
  font-size: 14px;
  color: #f9a8d4;
  margin-bottom: 6px;
`

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #fff;
`

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
`

const List = styled.div`
  display: grid;
  gap: 12px;
`

const ListItem = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(236,72,153,0.2);
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  grid-column: 1 / -1;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const Tag = styled.span`
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(236,72,153,0.35);
  background: rgba(236,72,153,0.12);
  color: #f9a8d4;
`

const MessManagerDashboard = () => {
  const stats = [
    { label: 'Meals Served (today)', value: 1240, icon: FireIcon },
    { label: 'Active Students', value: 980, icon: UserGroupIcon },
    { label: 'Purchases (today)', value: 32, icon: ShoppingCartIcon },
    { label: 'Revenue (today)', value: '₹86,400', icon: CurrencyRupeeIcon },
  ]

  const purchases = [
    { id: 1, item: 'Rice 50kg', vendor: 'Sri Ganesh Traders', time: '08:30 AM' },
    { id: 2, item: 'Vegetables', vendor: 'City Fresh Mart', time: '09:10 AM' },
    { id: 3, item: 'Milk 100L', vendor: 'Aavin', time: '06:30 AM' },
  ]

  const deliveries = [
    { id: 1, vendor: 'Fresh Farms', eta: '10:15 AM', status: 'enroute' },
    { id: 2, vendor: 'Bakery Hub', eta: '12:00 PM', status: 'scheduled' },
  ]

  return (
    <Shell>
      <Grid>
        {stats.map((s, i) => (
          <Stat key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div>
              <StatLabel>{s.label}</StatLabel>
              <StatValue>{s.value}</StatValue>
            </div>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(236,72,153,0.18)', display: 'grid', placeItems: 'center' }}>
              <s.icon className="w-6 h-6 text-pink-300" />
            </div>
          </Stat>
        ))}

        <Row>
          <Card initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <SectionTitle>
              <ShoppingCartIcon className="w-5 h-5 text-pink-300" /> Recent Purchases
            </SectionTitle>
            <List>
              {purchases.map(p => (
                <ListItem key={p.id}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(236,72,153,0.18)', display: 'grid', placeItems: 'center' }}>
                    <CheckBadgeIcon className="w-5 h-5 text-pink-300" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{p.item}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{p.vendor} • {p.time}</div>
                  </div>
                </ListItem>
              ))}
            </List>
          </Card>

          <Card initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <SectionTitle>
              <TruckIcon className="w-5 h-5 text-emerald-300" /> Deliveries
            </SectionTitle>
            <List>
              {deliveries.map(d => (
                <ListItem key={d.id}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.18)', display: 'grid', placeItems: 'center' }}>
                    <TruckIcon className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{d.vendor}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>ETA {d.eta}</div>
                  </div>
                  <Tag>{d.status}</Tag>
                </ListItem>
              ))}
            </List>
          </Card>
        </Row>
      </Grid>
    </Shell>
  )
}

export default MessManagerDashboard
