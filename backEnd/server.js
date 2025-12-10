//RUTAI NIGGER KOD
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt= require('bcrypt');
const util = require('util');

// Add this helper function somewhere accessible in your server code:
const dbQueryPromise = (sql, params) => {
  return new Promise((resolve, reject) => {
    // We are using the original callback-style db.query here
    db.query(sql, params, (dbErr, data) => { 
      if (dbErr) return reject(dbErr); // <-- IMPORTANT: Reject with the clean DB error!
      resolve(data);
    });
  });
};

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
  const { name, password } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });

  let sql = "SELECT * FROM users WHERE name = ?";
  db.query(sql, [name], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json({ message: "User " + name + " not found" });
    const user = data[0];
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    res.json(data); // return the user object
  });
});
app.post('/register', (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ message: "Name or password missing" });
  const hashedPassword = bcrypt.hashSync(password, 10);

  let sql = "INSERT INTO users (name, password, money, level) VALUES (?, ?, 200, 1)";
  db.query(sql, [name, hashedPassword], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

app.post('/auth/google', async (req, res) => {
  const { googleId, name, email } = req.body;

  try {
    let sql = "SELECT * FROM users WHERE google_id = ?";
    db.query(sql, [googleId], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length > 0) {
        return res.json(data[0]);
      } else {
        let insertSql = "INSERT INTO users (name, email, google_id, money, level) VALUES (?, ?, ?, 200, 1)";
        db.query(insertSql, [name, email, googleId], (err, result) => {
          if (err) return res.status(500).json(err);
          let selectSql = "SELECT * FROM users WHERE id = ?";
          db.query(selectSql, [result.insertId], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.json(data[0]);
          });
        });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
});

app.get('/users', (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, data) => {
      if (err) {
        // 1. Log the full error to your Node.js console/terminal
        console.error("Database Query Error:", err);
        
        // 2. Return a more informative response to the client
        // The `err` object often contains `code`, `errno`, and a detailed `sqlMessage`.
        // We return the whole object for debugging, but in production, you'd be more selective.
        return res.status(500).json({
          message: "Database query failed",
          details: err // Return the full error object
        });
      }
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
  const sql = "INSERT INTO buildings (`user_id`, `lat`, `lng`, `level`, `income`, `upgradeCost`, `name`,`type`, `incomeMultiplier`, `upgradeCostMultiplier` ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  db.query(sql, [user_id, building.lat, building.lng, building.level, building.income, building.upgradeCost, building.name, building.type, building.incomeMultiplier, building.upgradeCost], (err, data) => {
    if (err){
      console.error("DB INSERT ERROR:", err);   // <-- ADD THIS
      return res.status(500).json("ahoj" + err);
    }
    res.json(data);
  });
});

app.post('/users/:user_id/tasks', async (req, res) => {
  const tasks = req.body;
  
  if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: "Invalid or empty tasks array." });
  }
  
  const sql = "INSERT INTO tasks (`fromId`, `goalId`, `goalName`, `reward`, `distance`) VALUES (?, ?, ?, ?, ?) ";
  
  try {
    // Use the custom promise wrapper for each query
    const insertionPromises = tasks.map(task => {
      const params = [task.fromId, task.goalId, task.goalName, task.reward, task.distance];
      return dbQueryPromise(sql, params); // <--- Using the Promise wrapper
    });

    const results = await Promise.all(insertionPromises);

    res.status(201).json({ message: "Tasks saved successfully", results: results });

  } catch (dbErr) { // Renamed 'err' to 'dbErr' for clarity
    // Now, dbErr will be the clean database error object, not the circular Query object!
    
    console.error("Task saving error (DB Error):", dbErr);
    
    // We can now safely send the error details as they are no longer circular
    res.status(500).json({ 
        error: "Failed to save one or more tasks", 
        // Use the safe string properties
        details: dbErr.sqlMessage || dbErr.message, 
        tasks 
    });
  }
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