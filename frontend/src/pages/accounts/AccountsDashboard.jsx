import React from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  CurrencyRupeeIcon,
  ClipboardDocumentListIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline'

const Shell = styled.div`
  min-height: 100vh;
  background: radial-gradient(1100px 700px at -10% -10%, rgba(99,102,241,0.12), transparent),
              radial-gradient(1100px 700px at 110% 110%, rgba(59,130,246,0.12), transparent),
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
  border: 1px solid rgba(99,102,241,0.25);
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
  color: #c4b5fd;
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
  border: 1px solid rgba(99,102,241,0.2);
`

const Tag = styled.span`
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(99,102,241,0.35);
  background: rgba(99,102,241,0.12);
  color: #c4b5fd;
`

const AccountsDashboard = () => {
  const stats = [
    { label: 'Total Revenue (30d)', value: '₹12.6L', icon: CurrencyRupeeIcon },
    { label: 'Pending Dues', value: '₹3.1L', icon: ReceiptPercentIcon },
    { label: 'Transactions (today)', value: 214, icon: BanknotesIcon },
    { label: 'Growth', value: '12.3%', icon: ArrowTrendingUpIcon },
  ]

  const transactions = [
    { id: 1, title: 'Hostel Fee - Semester I', amount: '₹12,000', time: '09:10 AM' },
    { id: 2, title: 'Mess Advance', amount: '₹5,000', time: '08:45 AM' },
    { id: 3, title: 'Fine - Late Payment', amount: '₹250', time: 'Yesterday' },
  ]

  const dues = [
    { id: 1, student: 'Rahul Kumar', amount: '₹2,000', due: '3 days' },
    { id: 2, student: 'Priya Sharma', amount: '₹1,500', due: '1 week' },
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
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(99,102,241,0.2)', display: 'grid', placeItems: 'center' }}>
              <s.icon className="w-6 h-6 text-indigo-300" />
            </div>
          </Stat>
        ))}

        <Card initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ gridColumn: 'span 7' }}>
          <SectionTitle>
            <BanknotesIcon className="w-5 h-5 text-indigo-300" /> Recent Transactions
          </SectionTitle>
          <List>
            {transactions.map(t => (
              <ListItem key={t.id}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.18)', display: 'grid', placeItems: 'center' }}>
                  <CurrencyRupeeIcon className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{t.time}</div>
                </div>
                <Tag>{t.amount}</Tag>
              </ListItem>
            ))}
          </List>
        </Card>

        <Card initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ gridColumn: 'span 5' }}>
          <SectionTitle>
            <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-300" /> Pending Dues
          </SectionTitle>
          <List>
            {dues.map(d => (
              <ListItem key={d.id}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(79,70,229,0.18)', display: 'grid', placeItems: 'center' }}>
                  <ReceiptPercentIcon className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{d.student}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Due in {d.due}</div>
                </div>
                <Tag>{d.amount}</Tag>
              </ListItem>
            ))}
          </List>
        </Card>
      </Grid>
    </Shell>
  )
}

export default AccountsDashboard
