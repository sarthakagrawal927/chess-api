const fs = require("fs")

const filePath = "./temp.txt"

fs.watchFile(filePath, {interval: 10} ,() => {
  fs.readFile(filePath, 'utf8', function(err, data){
    console.log(data);
  });
})