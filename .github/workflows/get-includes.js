var fs = require('fs');
console.log(JSON.parse(fs.readFileSync('src/build.json', 'utf8')).includes.join(" "));