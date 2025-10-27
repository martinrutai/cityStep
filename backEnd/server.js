//RUTAI NIGGER KOD
/*const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'carprice'
});

app.get('/', (req, res) => {
    return res.json("From server: Hello World");
});

app.get('/cars', (req, res) => {
    const sql = "SELECT * FROM cars";
    db.query(sql, (err, data) => {
        if (err) return res.json("problemik: " + err);
        return res.json(data);
    });
});

app.listen(8081, () => {
    console.log("listening");
});*/

const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'citygame'
});

// ✅ Test endpoint
app.get('/', (req, res) => {
  res.json("From server: City Game API running 🏙️");
});

//
// 🧍 USER ROUTES
//

// Get all users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, data) => {
    if (err) return res.json(err);
    res.json(data);
  });
});

// Create a new user
app.post('/users', (req, res) => {
  const { username, money } = req.body;
  const sql = 'INSERT INTO users (username, money) VALUES (?, ?)';
  db.query(sql, [username, money || 0], (err, result) => {
    if (err) return res.json(err);
    res.json({ id: result.insertId, username, money });
  });
});

// Update user's money
app.put('/users/:id/money', (req, res) => {
  const { money } = req.body;
  const { id } = req.params;
  const sql = 'UPDATE users SET money = ? WHERE id = ?';
  db.query(sql, [money, id], (err, result) => {
    if (err) return res.json(err);
    res.json({ message: 'Money updated', money });
  });
});

//
// 🏠 BUILDING ROUTES
//

// Get all buildings for a user
app.get('/users/:id/buildings', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM buildings WHERE user_id = ?';
  db.query(sql, [id], (err, data) => {
    if (err) return res.json(err);
    res.json(data);
  });
});

// Add a new building
app.post('/users/:id/buildings', (req, res) => {
  const { id } = req.params;
  const { lat, lng, level, income, upgradeCost } = req.body;
  const sql = `
    INSERT INTO buildings (user_id, lat, lng, level, income, upgradeCost)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [id, lat, lng, level, income, upgradeCost], (err, result) => {
    if (err) return res.json(err);
    res.json({ id: result.insertId, user_id: id, lat, lng, level, income, upgradeCost });
  });
});

// Update a building (e.g. after upgrade)
app.put('/buildings/:id', (req, res) => {
  const { id } = req.params;
  const { level, income, upgradeCost } = req.body;
  const sql = 'UPDATE buildings SET level=?, income=?, upgradeCost=? WHERE id=?';
  db.query(sql, [level, income, upgradeCost, id], (err) => {
    if (err) return res.json(err);
    res.json({ message: 'Building updated' });
  });
});

// Delete a building (when sold)
app.delete('/buildings/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM buildings WHERE id=?';
  db.query(sql, [id], (err) => {
    if (err) return res.json(err);
    res.json({ message: 'Building deleted' });
  });
});

//
// Start server
//
app.listen(8081, () => {
  console.log('✅ CityGame API listening on port 8081');
});
