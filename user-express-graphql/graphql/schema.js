const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type User {
    ID : String!
    email : String!
    lastName : String!
    firstName : String!
    address : String!
  }
  
  input userInputData {
    email : String!
    password: String!
    lastName : String!
    firstName : String!
    address : String!
  }
  input userUpdateData{
    email : String!
    address : String
    password: String
  }
  type Message{
    message : String!
  }
  type rootQuery {
    profile(userEmail:String!) : User
  }
  type RootMutation{
    createUser (userData:userInputData!): User!
    updateUser(userUpdate:userUpdateData!) : Message!
    removeUser(email:String!):Message!
  } 

schema {
  mutation : RootMutation
  query : rootQuery
}
`);
