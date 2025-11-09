//RUTAI NIGGER KOD
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'citystep'
});

app.get('/', (req, res) => {
    return res.json("From server: Hello World");
});

app.post('/login', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });

  const sql = "SELECT * FROM users WHERE name = ?";
  db.query(sql, [name], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(data); // return the user object
  });
});

app.get('/users', (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, data) => {
        if (err) return res.json("problemik: " + err);
        return res.json(data);
    });
});

app.get('/users/:user_id/buildings', (req, res) => {
  const { user_id } = req.params;
  const sql = 'SELECT * FROM buildings WHERE user_id = ?';
  db.query(sql, [user_id], (err, data) => {
    if (err) return res.json(err);
    res.json(data);
  });
});

app.post('/users/:user_id/buildings', (req, res) => {
  const { user_id } = req.params;
  const { building } = req.body;
  const sql = "INSERT INTO buildings (`user_id`, `lat`, `lng`, `level`, `income`, `upgradeCost`, `name`) VALUES (?, ?, ?, ?, ?, ?, ?)"
  db.query(sql, [user_id, building.lat, building.lng, building.level, building.income, building.upgradeCost, building.name], (err, data) => {
    if (err){
      console.error("DB INSERT ERROR:", err);   // <-- ADD THIS
      return res.status(500).json("ahoj" + err);
    }
    res.json(data);
  });
});

app.get('/users/:user_id/buildings/:id', (req, res) => {
  const { user_id, id } = req.params;
  const sql = 'SELECT * FROM buildings WHERE user_id = ? AND id = ?';
  db.query(sql, [user_id, id], (err, data) => {
    if (err) return res.json(err);
    res.json(data);
  });
});

app.get('/users/:id/money', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT money FROM users WHERE id = ?';
  db.query(sql, [id], (err, data) => {
    if (err) return res.json(err);
    res.json(data);
  });
});

app.put('/users/:id/money', (req, res) => {
  const { id } = req.params;
  const { money } = req.body;
  const sql = 'UPDATE users SET money = ? WHERE id = ?';
  db.query(sql, [money, id], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

app.listen(8081, () => {
    console.log("listening");
});

/*useEffect(() => {
    async function loadData() {
      fetch('http://localhost:8081/users')
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.log(err));
    }
    loadData();
  }, []);*/
/*

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
*/