const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.admin = true;
    return res.json({ success: true, redirect: '/admin/dashboard' });
  }
  res.status(401).json({ success: false, error: 'Identifiants incorrects' });
};

exports.dashboard = (req, res) => {
  res.sendFile('admin.html', { root: 'public' });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, redirect: '/admin/login' });
  });
};
