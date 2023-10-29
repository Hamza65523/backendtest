const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { createLogger, format, transports } = require('winston');
const expressWinston = require('express-winston');
const { combine, timestamp, label, printf } = format;

require('dotenv').config();

const app = express();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error',()=>{
  logger.error('MongoDB connection error:');
  console.error.bind(console, 'MongoDB connection error:')});
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
});


const PORT = process.env.PORT || 4000;


const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'MyApp' }),
    timestamp(),
    printf(({ timestamp, label, level, message }) => {
      return `${timestamp} [${label}] ${level}: ${message}`;
    })
  ),
  transports: [new transports.Console(), new transports.File({ filename: 'error.log', level: 'error' })],
});

// Log HTTP requests and responses using express-winston
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    expressFormat: true,
    meta: false,
  })
);
app.get('/test-error', (req, res) => {
  try {
    const undefinedVariable = someObject.undefinedProperty;
  } catch (error) {
    logger.error('Test error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.log(err,'err,err,err,',res,)
  logger.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Apply middleware
server.start().then(() => {
  server.applyMiddleware({ app });

  app.listen({ port: PORT }, () => {
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
  });
});