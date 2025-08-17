
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.get('/api/_healthz', (req, res) => res.json({ ok: true, time: Date.now() }));

app.post('/api/_echo', (req, res)=>{
  res.status(200).json({ received: req.body });
});
app.get('/api/_whoami', require('./middleware/authMiddleware').protect, (req, res) => {
  res.json({ id: req.user?._id, email: req.user?.email, role: req.user?.role });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/passes', require('./routes/passRoutes'));


app.use((err, req, res, next) => {
  console.error('ERR', err);
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined: err.stack, 
  });
});

// Export the app object for testing
if (require.main === module) {
    connectDB().then(() => {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`[API] Listening on http://127.0.0.1:${PORT}`));
    }).catch(err => {
      console.error('Mongo connect failed', err);
      process.exit(1);
    });
  }

module.exports = app

