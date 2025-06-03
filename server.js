const express = require('express');
const session = require('express-session');
const multer = require('multer');
const { Low, JSONFile } = require('lowdb');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const adapter = new JSONFile('db.json');
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data ||= { users: [], playlists: [] };
  await db.write();
}
initDB();

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'iptvsecret',
  resave: false,
  saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  await db.read();
  const { email, password } = req.body;
  const user = db.data.users.find(u => u.email === email && u.password === password);
  if (!user) return res.send('Login fehlgeschlagen.');
  req.session.user = user;
  res.redirect(user.role === 'admin' ? '/admin' : '/dashboard');
});

app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
  await db.read();
  const { email, password } = req.body;
  if (db.data.users.find(u => u.email === email)) return res.send('Benutzer existiert bereits.');
  db.data.users.push({ email, password, role: 'user' });
  await db.write();
  res.redirect('/login');
});

app.get('/dashboard', requireLogin, async (req, res) => {
  if (req.session.user.role === 'admin') return res.redirect('/admin');
  res.render('dashboard-user', { user: req.session.user });
});

app.get('/admin', requireLogin, async (req, res) => {
  if (req.session.user.role !== 'admin') return res.send('Kein Zugriff.');
  await db.read();
  res.render('dashboard-admin', {
    user: req.session.user,
    playlists: db.data.playlists
  });
});

app.get('/upload', requireLogin, (req, res) => {
  if (req.session.user.role !== 'admin') return res.send('Kein Zugriff.');
  res.render('upload');
});

app.post('/upload', upload.single('m3u'), async (req, res) => {
  if (req.session.user.role !== 'admin') return res.send('Kein Zugriff.');
  const filePath = req.file.path;
  const name = req.file.originalname;
  await db.read();
  db.data.playlists.push({ name, path: filePath });
  await db.write();
  res.redirect('/admin');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.listen(3000, () => console.log('🔑 Panel läuft auf http://localhost:3000'));
