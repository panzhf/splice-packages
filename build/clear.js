var fs = require('fs')
function deleteFolder(path = 'dist') {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(file => {
      var curPath = path + '\\' + file
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        deleteFolder(curPath)
      } else {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}
deleteFolder()
