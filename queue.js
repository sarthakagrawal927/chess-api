const Queue = require('bee-queue');
const Redis = require('ioredis');

const votingQueue = new Queue('voting');
const redisClient = new Redis();

const addVoteToQueue = (vote) => {
  votingQueue.createJob(vote).save();
}

const getProgressReport = async () => {
  return votingQueue.getJobs("waiting").then((jobs) => {
    return {
      waiting: jobs.length
    }
  });
}

const getVoteResult = async (matchId) => {
  return redisClient.mget("yes", "no").then((result) => {
    return {
      yes: parseInt(result[0]),
      no: parseInt(result[1])
    }
  })
}

votingQueue.process(async (job, done) => {
  console.log({vote: job.data.ans})
  redisClient.incrby(job.data.ans === 1 ? "yes" : "no", 1)
  done();
})

module.exports = {
  addVoteToQueue,
  getProgressReport,
  getVoteResult
}
