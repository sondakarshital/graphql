const express = require('express');
const app = express();
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const graphqlSchema = require('./graphql/schema');
const resolvers = require('./graphql/resolver');

mongoose.connect(
  'mongodb://localhost/user_db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log('user DB connected');
  }
);
app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: resolvers,
    graphiql: true,
    formatError(err){
      if(!err.originalError){
        throw err
      }
      let message = err.message || 'An error occured'
      let status = err.originalError.status || 500
      return {message,status}
    }
  })
);
app.listen(4000, () => {
  console.log(`app listening on 4000`);
});
