const { Client } = require('pg')

const client = new Client({
  host: 'prueba.streamingpro.marceloremeseiro.com',  // IP del servidor
  port: 32792,             // puerto mapeado externo
  database: 'defaultdb',
  user: 'admin',
  password: 'test'
})

async function testConnection() {
  try {
    await client.connect()
    const result = await client.query('SELECT NOW()')
    console.log('Conexión exitosa!', result.rows[0])
  } catch (error) {
    console.error('Error de conexión:', error)
  } finally {
    await client.end()
  }
}

testConnection() 