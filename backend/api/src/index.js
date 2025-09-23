require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true }));
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/security', require('./routes/security'));
  app.use('/api/students', require('./routes/students'));
  app.use('/api/hostels', require('./routes/hostels'));
  app.use('/api/complaints', require('./routes/complaints'));
  app.use('/api/feedback', require('./routes/feedback'));
  app.use('/api/disciplinary', require('./routes/disciplinary'));
  app.use('/api/payments', require('./routes/payments'));
  app.use('/api/attendance', require('./routes/attendance'));
  app.use('/api/circulars', require('./routes/circulars'));
  app.use('/api/admissions', require('./routes/admissions'));
  app.use('/api/applications', require('./routes/applications'));
  app.use('/api/admin/allotments', require('./routes/allotments'));
  app.use('/api/uploads', require('./routes/uploads'));
  app.use('/api/files', require('./routes/files'));
  app.use('/api/fees', require('./routes/fees'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/appeals', require('./routes/appeals'));
  app.use('/api/rc', require('./routes/rc'));
  app.use('/api/rc-extras', require('./routes/rc_extras'));
  app.use('/api/notifications', require('./routes/notifications'));
  app.use('/public', require('./routes/public'));
} catch (e) {
  console.error('Startup warning:', e.message);
  app.get('/startup-warning', (req, res) => res.status(500).json({ error: e.message }));
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
