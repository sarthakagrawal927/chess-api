const express = require('express');
const commentaryRouter = express.Router();
const catcher = require('../utils/functions');
const { executeQuery } = require('../utils/db');

/**
 * CREATE TABLE commentary (
    id SERIAL PRIMARY KEY,
    match_id INTEGER,
    text TEXT
  );
 */

commentaryRouter.get('/', catcher( async(request, response) => {
  if(!request.query.match_id) {
    return response.status(400).json({status: "error", message: "match_id is required"})
  }
  return await executeQuery('SELECT * FROM commentary WHERE match_id = $1', [request.query.match_id], response)
}))

commentaryRouter.post('/add', catcher( async(request, response) => {
  if(!request.body.matchId || !request.body.text) {
    return response.status(400).json({status: "error", message: "matchId and text are required"})
  }
  // send to WYRE
  return await executeQuery('INSERT INTO commentary (match_id, text) VALUES ($1, $2)', [request.body.matchId, request.body.text], response)
}))

module.exports = commentaryRouter