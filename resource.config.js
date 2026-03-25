'use strict'
let fs = require('fs')
let path = require('path')
let rootPath = path.resolve(__dirname, './dist/build/h5')
renameJs(() => {
  renameCss()
})

function renameJs(cb) {
  let newNameArr = []
  fs.readdir(`${rootPath}/static/js`, (err, nameArr) => {
    if (err) {
      console.error('ERROR: '.error, err)
    }

    // get the name
    for (let i = 0; i < nameArr.length; i++) {
      if (/^chunk-vendors/.test(nameArr[i]) && /\.js$/.test(nameArr[i])) {
        newNameArr[i] = 'chunk-vendors.js'
      } else if (/^index/.test(nameArr[i]) && /\.js$/.test(nameArr[i])) {
        newNameArr[i] = 'index.js'
      } else {
        newNameArr[i] = nameArr[i]
      }
    }

    // rename
    for (let i = 0; i < nameArr.length; i++) {
      let oldPath = `${rootPath}/static/js/${nameArr[i]}`
      let newPath = `${rootPath}/static/js/${newNameArr[i]}`
      fs.rename(oldPath, newPath, err => {
        if (!err) {
          // console.log(newNameArr[i])
        }
      })
    }
    cb && cb()
  })
}

function renameCss(cb) {
  let newNameArr = []
  fs.readdir(`${rootPath}/static`, (err, nameArr) => {
    if (err) {
      console.error('ERROR: '.error, err)
    }
    // get the name
    for (let i = 0; i < nameArr.length; i++) {
      if (/index/.test(nameArr[i]) && /\.css$/.test(nameArr[i])) {
        newNameArr[i] = nameArr[i].split('.')[0] + '.css'
        let oldPath = `${rootPath}/static/${nameArr[i]}`
        let newPath = `${rootPath}/static/${newNameArr[i]}`
        fs.rename(oldPath, newPath, err => {
          if (!err) {
            console.log('rename success!')
          }
        })
      }
    }

    cb && cb()
  })
}
