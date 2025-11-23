const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- DB config from environment variables ----
const DB_HOST = process.env.DB_HOST;          // e.g. mini-task-manager-db.c18siu0w4hup.ap-south-1.rds.amazonaws.com
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER;          // e.g. mtm_user
const DB_PASSWORD = process.env.DB_PASSWORD;  // your RDS password
const DB_NAME = process.env.DB_NAME || 'mini_task_manager';

let pool; // will hold our connection pool

async function initDb() {
  console.log('Initializing database connection...');

  // Basic safety check so we fail fast if something is missing
  if (!DB_HOST || !DB_USER || !DB_PASSWORD) {
    throw new Error(
      `Missing DB env vars. Got: DB_HOST=${DB_HOST}, DB_USER=${DB_USER}, DB_PASSWORD=${DB_PASSWORD ? '***' : 'MISSING'}`
    );
  }

  // 1) First connect WITHOUT database to create it if needed
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  console.log(`Ensured database ${DB_NAME} exists`);

  await connection.end();

  // 2) Now create a pool WITH that database
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  // 3) Create tasks table if it doesn’t exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL
    )
  `);
  console.log('Ensured tasks table exists');

  // 4) Seed data if table is empty
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM tasks');
  if (rows[0].count === 0) {
    console.log('Seeding initial tasks...');
    const seedTasks = [
      ['Connect AWS free tier account', 'TODO'],
      ['Learn S3, CloudFront, ACM basics', 'IN-PROGRESS'],
      ['Deploy backend API on ECS + RDS', 'COMING SOON'],
      ['Add CI/CD with GitHub Actions', 'COMING SOON'],
    ];

    for (const [title, status] of seedTasks) {
      await pool.query(
        'INSERT INTO tasks (title, status) VALUES (?, ?)',
        [title, status]
      );
    }
  }

  console.log('✅ Database ready');
}

// Simple health check (for humans)
app.get('/', (req, res) => {
  res.send('Mini Task Manager API is running (MySQL RDS backend)');
});

// Health check for load balancer / monitoring
app.get('/health', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ status: 'DB_NOT_INITIALIZED' });
  }

  try {
    await pool.query('SELECT 1 AS ok');
    res.json({ status: 'OK' });
  } catch (err) {
    console.error('Healthcheck DB error:', err);
    res.status(500).json({ status: 'DB_ERROR' });
  }
});

// Return tasks from DB
app.get('/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, status FROM tasks ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching tasks from DB:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Start app only AFTER DB init
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Mini Task Manager API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize DB:', err);
    // In ECS this will cause the task to stop, which is what we want
    process.exit(1);
  });
