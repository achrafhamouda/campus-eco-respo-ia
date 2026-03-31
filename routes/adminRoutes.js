const express = require('express');
const router = express.Router();
const { login, dashboard, logout } = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');

router.get('/login', (req, res) => {
  if (req.session && req.session.admin) return res.redirect('/admin/dashboard');
  res.sendFile('login.html', { root: 'public' });
});

router.post('/login', login);
router.get('/dashboard', requireAuth, dashboard);
router.post('/logout', requireAuth, logout);

module.exports = router;
