const { Client } = require('pg')
const db = new Client({ host: '10.0.0.1', port: 5432, database: 'controle', user: 'postgres', password: 'masterkey' })
db.connect().then(() => { console.log('conectado!'); db.end() }).catch(e => console.error('erro:', e.message))
