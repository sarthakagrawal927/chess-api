import fs from "fs"
import fetch from "node-fetch"

const filePath = "./temp.txt"

fs.watchFile(filePath, {interval: 10} ,() => {
  fs.readFile(filePath, 'utf8', async function(err, data){
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