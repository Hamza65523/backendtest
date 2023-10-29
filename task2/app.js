const express = require('express');
const app = express();
const { Queue,Worker } = require('bullmq');
const Redis = require('ioredis');

const redisConfig = {
  port: 6379,
  host: '127.0.0.1',
};

const redisConnection = new Redis(redisConfig);


const queue = new Queue('myQueue', { redisConnection });


app.use(express.json())
app.get('/job/:jobId', async (req, res) => {
  const jobId = req.params.jobId;
  const job = await queue.getJob(jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  if (job.returnvalue) {
    res.json({ status: 'completed', result: job.returnvalue });
  } else if (job.failedReason) {
    res.json({ status: 'failed', reason: job.failedReason });
  } else if (job.isCompleted()) {
    res.json({ status: 'completed', result: 'Result not available' });
  } else {
    res.json({ status: 'active' });
  }
});

app.post('/job', async (req, res) => {
  const jobData = req.body;
  console.log(jobData)
  const job = await queue.add('send to hamza',jobData);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  res.json({jobid:job.id})
});


const worker = new Worker('myQueue',async(job)=>{
    console.log(job.id)
    console.log(job.data)
    console.log('sending email')
    await new Promise((res,rej)=>setTimeout(()=>res(),15*1000))
    console.log('Email sended')
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
