const fetch = require("node-fetch")

const getDataWithFen = async (fen) => {
    return fetch(`http://20.88.20.165:5000/analyze?key=685DF1BA33A0F7C90A7C197EFC99CFEA1F9F88AA&idx=11&command=go&fen=${fen}`)
      .then(res => res.json())
      .catch(err => console.log(err));
}

module.exports = { getDataWithFen }