const bcrypt = require('bcryptjs')

async function generateHash() {
  const password = process.argv[2] || 'demo'
  const hash = await bcrypt.hash(password, 10)
  
  console.log('\n=================================')
  console.log('Password Hash Generator')
  console.log('=================================')
  console.log(`\nPassword: ${password}`)
  console.log(`Hash: ${hash}`)
  console.log('\nCopy this hash to your Cosmic team_members object password_hash field')
  console.log('=================================\n')
}

generateHash().catch(console.error)