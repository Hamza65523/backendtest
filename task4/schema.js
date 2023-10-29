// schema.js
const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!): User
    updateUser(id: ID!, username: String, email: String, password: String): User
    deleteUser(id: ID!): User
  }
`;

module.exports = typeDefs;
