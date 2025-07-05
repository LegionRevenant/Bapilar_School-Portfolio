const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',         // default user
  password: '',         // default blank password in XAMPP
  database: 'aquaaligned'
})

db.connect(err => {
  if (err) return console.error('DB Error:', err)
  console.log('Connected to MySQL')
})

// GET logs
app.get('/logs', (req, res) => {
  db.query('SELECT * FROM logs ORDER BY date DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})

// POST log
app.post('/logs', (req, res) => {
  const { activityType, amount } = req.body
  db.query(
    'INSERT INTO logs (activityType, amount) VALUES (?, ?)',
    [activityType, amount],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ id: result.insertId })
    }
  )
})



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

app.get('/users', (req, res) => {
  db.query('SELECT id, email, password, created FROM users ORDER BY id ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})

app.post('/users', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.query(
    'SELECT id, email, created FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, results) => {
      if (err) {
        console.error('Login DB error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = results[0];
      res.json({ id: user.id, email: user.email, created: user.created });
    }
  );
});

app.post('/add-log', (req, res) => {
  const { activityType, amount, date } = req.body;

  const logQuery = 'INSERT INTO logs (activityType, amount, date) VALUES (?, ?, ?)';
  db.query(logQuery, [activityType, amount, date], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to insert log.' });

    // After inserting log, update daily_usage
    const updateDailyUsageQuery = `
      INSERT INTO daily_usage (date, total_refill, total_usage)
      VALUES (DATE(?), ?, ?)
      ON DUPLICATE KEY UPDATE
        total_refill = total_refill + VALUES(total_refill),
        total_usage = total_usage + VALUES(total_usage);
    `;

    const refill = activityType === 'Refill' ? amount : 0;
    const usage = activityType === 'Usage' ? amount : 0;

    db.query(updateDailyUsageQuery, [date, refill, usage], (err2) => {
      if (err2) return res.status(500).json({ error: 'Log inserted, but failed to update daily usage.' });

      return res.status(200).json({ message: 'Log added and daily usage updated.' });
    });
  });
});

app.delete('/logs/:id', (req, res) => {
  const logId = req.params.id;
  db.query('DELETE FROM logs WHERE id = ?', [logId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Log not found' });
    res.status(200).json({ message: 'Log deleted' });
  });
});


app.get('/daily-usage', (req, res) => {
  db.query('SELECT * FROM daily_usage ORDER BY date DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to get daily usage.' });
    res.json(results);
  });
});

app.get('/weekly-usage', (req, res) => {
  const query = `
    SELECT YEARWEEK(date, 1) AS week, 
           SUM(total_refill) AS total_refill, 
           SUM(total_usage) AS total_usage
    FROM daily_usage
    GROUP BY week
    ORDER BY week DESC
    LIMIT 4;
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to get weekly usage.' });
    res.json(results);
  });
});


app.get('/monthly-usage', (req, res) => {
  const query = `
    SELECT DATE_FORMAT(date, '%Y-%m') AS month,
           SUM(total_refill) AS total_refill,
           SUM(total_usage) AS total_usage
    FROM daily_usage
    GROUP BY month
    ORDER BY month DESC
    LIMIT 6;
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to get monthly usage.' });
    res.json(results);
  });
});

app.post('/sensor-data', (req, res) => {
  console.log('\n>>> Incoming payload:', req.body); 

  const { temperature, distance_cm } = req.body;

  if (temperature == null || distance_cm == null) {
    console.log(' Missing data:', req.body);
    return res.status(400).json({ error: 'Missing temperature or distance_cm' });
  }

  const query = `
    UPDATE sensor_data
    SET temperature = ?, distance_cm = ?, recorded_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `;

  db.query(query, [temperature, distance_cm], (err, result) => {
    if (err) {
      console.error(' Sensor DB error:', err);  
      return res.status(500).json({ error: 'Failed to update sensor data' });
    }

    console.log(' DB Update success:', result);
    res.json({ message: 'Sensor data recorded' });
  });
});


app.get('/sensor-data', (req, res) => {
  db.query('SELECT * FROM sensor_data ORDER BY recorded_at DESC LIMIT 100', (err, results) => {
    if (err) {
      console.error('Sensor DB error:', err);
      return res.status(500).json({ error: 'Failed to fetch sensor data' });
    }
    res.json(results);
  });
});

app.get('/tank-settings', (req, res) => {
  db.query('SELECT * FROM tankdata ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch tank settings.' });
    if (!results[0]) return res.status(404).json({ error: 'No tank settings found.' });

    const row = results[0];
    res.json({
      tankShape: row.type,
      height: row.height,
      width: row.width,
      length: row.length,
      diameter: row.diameter,
      thresholdType: row.threshold_type,
      thresholdValue: row.threshold_value,
      notificationsEnabled: !!row.notifications_enabled,
      autologEnabled: !!row.autolog_enabled,
      autologInterval: row.autolog_interval_minutes,
      autologMinChange: row.autolog_min_difference
    });
  });
});

app.post('/tank-settings', (req, res) => {
  const {
    thresholdType,
    thresholdValue,
    tankShape,
    dimensions,
    notificationsEnabled,
    autologEnabled,
    autologInterval,
    autologMinChange
  } = req.body;

  const { height, width, length, diameter } = dimensions;

  const query = `
    UPDATE tankdata
    SET
      type = ?,
      height = ?,
      width = ?,
      length = ?,
      diameter = ?,
      threshold_type = ?,
      threshold_value = ?,
      notifications_enabled = ?,
      autolog_enabled = ?,
      autolog_interval_minutes = ?,
      autolog_min_difference = ?,
      updated_at = NOW()
    WHERE id = 1
  `;

  db.query(query, [
    tankShape, height, width, length, diameter,
    thresholdType, thresholdValue, notificationsEnabled,
    autologEnabled, autologInterval, autologMinChange
  ], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update tank settings.' });
    res.status(200).json({ message: 'Tank settings updated.' });
  });
});




