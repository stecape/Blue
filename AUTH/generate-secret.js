import crypto from 'crypto'

// Genera un SESSION_SECRET casuale per il file .env
const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex')
}

console.log('\n🔑 SESSION_SECRET generato:')
console.log('=' .repeat(80))
console.log(generateSecret())
console.log('=' .repeat(80))
console.log('\n📋 Copia questo valore nel file server/.env nella variabile SESSION_SECRET\n')
