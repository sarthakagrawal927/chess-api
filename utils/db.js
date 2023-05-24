const Pool = require('pg').Pool

const pool = new Pool({
  user: 'sarthak',
  host: 'localhost',
  database: 'moves_dev',
  password: '12345678',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack)
  }
  client.query('SELECT NOW()', (err, result) => {
    release()
    if (err) {
      return console.error('Error executing query', err.stack)
    }
    console.log(result.rows)
  })
})

const executeQuery = async (query, params, response) => {
  pool.query(query, params, (error, results) => {
    if (error) {
      return response.status(500).json({status: "error", message: err})
    }
    return response.status(200).json({status: "ok", data: results.rows})
  })
}

module.exports = {
  executeQuery
}