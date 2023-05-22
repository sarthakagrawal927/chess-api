import fs from "fs"
import fetch from "node-fetch"

const filePaths = ["./temp.txt"]
const API_ENDPOINT = "ec2-15-206-69-32.ap-south-1.compute.amazonaws.com"

for (let i = 0; i < filePaths.length; i++) {
  fs.watchFile(filePaths[i], {interval: 10} ,() => {
    fs.readFile(filePaths[i], 'utf8', async function(err, data){
      try {
        fetch(API_ENDPOINT, {
          method: "POST",
          body: JSON.stringify({pgnFile: data}),
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(res => res.json())
        .then(res => console.log({res}))
        .catch(err => console.log({err}))
      }catch(err){
        console.log({err})
      }
    });
  })
}
