const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

require('dotenv').config();

const app = express();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
});


const PORT = process.env.PORT || 4000;

// Apply middleware
server.start().then(() => {
  server.applyMiddleware({ app });

  app.listen({ port: PORT }, () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
});