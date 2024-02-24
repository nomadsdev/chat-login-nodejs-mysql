const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const serverrun = `Server is running ${PORT}`;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATA
});

db.connect((err) => {
    if (err) {
        console.error('Error connection to database');
    } else {
        console.log('Connected to database');
    }
});

app.get('/', (req, res) => {
    if (req.session.name) {
        const sqlChat = `SELECT * FROM chats`;
        db.query(sqlChat, (err, result) => {
            if (err) throw err;
        res.render('index', { name: req.session.name, chats: result });
      });
    } else {
      res.render('index', { name: null, chats: null });
    }
});

app.post('/login', (req, res) => {
    const { name } = req.body;
    if (name) {
      req.session.name = name;
      res.redirect('/');
    } else {
      res.render('index', { errorlogin: 'กรุณาใส่ชื่อ' });
    }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
});

app.post('/send', (req, res) => {
    const { message } = req.body;
    const { name } = req.session;
    if (message && name) {
      const chat = { user_name: name, message: message };
      const sqlSend = `INSERT INTO chats SET ?`;
      db.query(sqlSend, chat, (err, result) => {
        if (err) throw err;
        res.redirect('/');
      });
    } else {
      res.render('index', { error: 'กรุณากรอกข้อความ!' })
    }
});

app.listen(PORT, () => {
    console.log(serverrun);
});