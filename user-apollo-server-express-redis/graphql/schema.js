const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    ID: String!
    email: String!
    lastName: String!
    firstName: String!
    address: String!
  }
  type Me {
    name: String!
  }

  input userInputData {
    email: String!
    password: String!
    lastName: String!
    firstName: String!
    address: String!
  }
  input userUpdateData {
    email: String!
    address: String
    password: String
  }
  type Message {
    message: String!
  }
  #Autors and posts types

  type Author {
    id: ID!
    name: String!
    posts(offset: Int, end: Int): [Post]
  }
  type Post {
    id: ID!
    title: String!
    authorId: ID!
  }
  # Queries
  type Query {
    profile(userEmail: String!): User
    #Authors query
    authors: [Author]
  }
  #Mutations
  type Mutation {
    createUser(userData: userInputData!): User!
    updateUser(userUpdate: userUpdateData!): Message!
    removeUser(email: String!): Message!
  }
  #Subscription type
  type Subscription {
    newUser: User!
  }
`;

module.exports = { typeDefs };
