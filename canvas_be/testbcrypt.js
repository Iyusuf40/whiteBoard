const bcrypt = require('bcrypt')

async function x(s) {
  const hash = await bcrypt.hash(s, 1)
  const res = await bcrypt.compare(s, hash)

  console.log(res)

  console.log(await bcrypt.compare('s', hash))

  const h1 = await bcrypt.hash(s, hash)
  const h2 = await bcrypt.hash(s, hash)

  console.log(h1 === h2)
}

x('test')
