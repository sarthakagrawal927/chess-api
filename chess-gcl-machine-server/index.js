import fs from "fs"
import fetch from "node-fetch"

const filePaths = ["./temp.txt", "./temp2.txt"]

for (let i = 0; i < filePaths.length; i++) {
  fs.watchFile(filePaths[i], {interval: 10} ,() => {
    fs.readFile(filePaths[i], 'utf8', async function(err, data){
      fetch("http://ec2-43-205-201-239.ap-south-1.compute.amazonaws.com:8080/", {
        method: "POST",
        body: JSON.stringify({pgnFile: data}),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(res => res.json())
      .then(res => console.log({res}))
      .catch(err => console.log(err))
    });
  })
}
