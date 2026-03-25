const fs = require('fs')
const copyFile = (from, to) => {
  return new Promise((resolve, reject) => {
    fs.unlink(to, () => {
      fs.writeFile(to, Buffer.from(fs.readFileSync(from)).toString('utf-8'), { flag: 'a' }, err => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  })
}

const minimist = require('minimist')
const params = minimist(process.argv.slice(2))

copyFile(`./json/${params.type}/pages.json`, './src/pages.json').then(
  () => {
    console.log(`${params.type}: pages.json, success`)
  },
  () => {
    console.log(`${params.type}: pages.json, fail`)
  }
)
