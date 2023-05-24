const express = require('express')
const { addVoteToQueue, getProgressReport, getVoteResult } = require('../queue.js');
const votesRouter = express.Router()

votesRouter.post('/vote', async(request, response) => {
  addVoteToQueue(request.body)
  response.status(200).json({status: "ok"})
})

votesRouter.get('/queue_progress', async(_request, response) => {
  response.status(200).json(await getProgressReport())
})

votesRouter.get("/vote_result", async(request, response) => {
  response.status(200).json(await getVoteResult(request.query.match_id))
})

module.exports = votesRouter

// (function simulateVoting(){
//   setInterval(()=>{
//     const ans = Math.random() > 0.5 ? 1 : 2
//     addVoteToQueue({ans})
//   }, 0.1)
// })();