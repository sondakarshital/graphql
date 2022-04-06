const User = require('../models/User');
const NEW_USER = 'NEW_USER';
const resolvers = {
  Subscription: {
    newUser: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(NEW_USER),
    },
  },
  Query: {
    profile: async (parent, { userEmail }) => {
      const user = await User.findOne({ email: userEmail });
      console.log(!user);
      if (!user) {
        let err = new Error();
        (err.message = 'No user found with this email ID'), (err.status = 404);
        throw err;
      }

      let { email, lastName, firstName, address } = user;

      return {
        ID: user._id.toString(),
        email,
        lastName,
        firstName,
        address,
      };
    },
    authors: async (parent, { args }) => {
      const authors = [
        { id: 1, name: 'Alex' },
        { id: 2, name: 'James' },
      ];
      return authors;
    },
  },
  Author: {
    posts: (author, { offset, end }) => {
      console.log('offset,end', offset, end);
      const posts = [
        {
          id: 1,
          title: 'Why GraphQL?',
          authorId: 1,
        },
        {
          id: 2,
          title: 'Creating a GraphQL API with Apollo Server',
          authorId: 1,
        },
        {
          id: 3,
          title: 'This should not be returned',
          authorId: 2,
        },
        {
          id: 3,
          title: 'Why Java?',
          authorId: 2,
        },
      ];
      return posts
        .filter((post) => post.authorId == author.id)
        .slice(offset, end);
    },
  },
  Mutation: {
    createUser: async (_, { userData }, { pubsub }) => {
      try {
        let { email, lastName, password, firstName, address } = userData;
        let data = new User({
          email,
          password,
          lastName,
          firstName,
          address,
        });
        const user = await data.save();
        let result = {
          ID: user._id.toString(),
          email,
          lastName,
          firstName,
          address,
        };
        pubsub.publish(NEW_USER, {
          newUser: result,
        });
        return result;
      } catch (error) {
        console.log('err ', error);
      }
    },
    removeUser: async (parent, { email }) => {
      try {
        let user = await User.findOne({ email });
        if (!user) return { message: `No user found with email: ${email}` };
        user.remove();
        return { message: `user removed with email :  ${email}` };
      } catch (error) {}
    },
    updateUser: async (parent, { userUpdate }) => {
      try {
        let updateData = {};
        if (!userUpdate.password && !userUpdate.address)
          return { message: 'please provide the valid input for updation' };
        if (userUpdate.password) updateData.password = userUpdate.password;
        if (userUpdate.address) updateData.address = userUpdate.address;
        let result = await User.findOneAndUpdate(
          { email: userUpdate.email },
          updateData
        );
        return { message: `User updated for email Id : ${userUpdate.email}` };
      } catch (error) {
        console.log('err ', error);
      }
    },
  },
};

module.exports = { resolvers };
