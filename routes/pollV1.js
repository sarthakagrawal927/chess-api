const express = require('express')
const catcher = require('../utils/functions')
const { executeQuery } = require('../utils/db')
const votesRouter = express.Router()

/**
CREATE TABLE poll (
    id SERIAL PRIMARY KEY, 
    question TEXT,
	match_id INTEGER,
    options TEXT[] 
);   

CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,  
    poll_id INTEGER,
    option_name TEXT   
);
 */

votesRouter.get('/', catcher(async(request, response) => {
  if(!request.query.match_id) {
    return response.status(400).json({status: "error", message: "match_id is required"})
  }
  return await executeQuery('SELECT * FROM poll WHERE match_id = $1', [request.query.match_id], response)
}))

votesRouter.get('/results', catcher(async(request, response) => {
  if(!request.query.poll_id) {
    return response.status(400).json({status: "error", message: "poll_id is required"})
  }
  return await executeQuery('SELECT count(*), option_name FROM responses WHERE poll_id = $1 group by option_name', [request.query.poll_id], response)
}))

votesRouter.post('/create', catcher(async(request, response) => {
  if(!request.body.matchId || !request.body.question || !request.body.options) {
    return response.status(400).json({status: "error", message: "matchId, question and options are required"})
  }
  // send to WYRE
  return await executeQuery('INSERT INTO poll (match_id, question, options) VALUES ($1, $2, $3)', [request.body.matchId, request.body.question, request.body.options], response)
}))

votesRouter.post('/vote', catcher(async(request, response) => {
  if(!request.body.answerValue || !request.body.pollId || !request.body.userId) {
    return response.status(400).json({status: "error", message: "userId, answerValue and pollId are required"})
  }
  return await executeQuery('INSERT INTO responses (user_id, poll_id, option_name) VALUES ($1, $2, $3)', [request.body.userId, request.body.pollId, request.body.answerValue], response)
}))

module.exports = votesRouter