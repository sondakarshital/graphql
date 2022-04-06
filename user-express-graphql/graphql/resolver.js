const User = require('../models/User');
module.exports = {
  profile: async ({ userEmail }, req) => {
    const user = await User.findOne({ email: userEmail });
    console.log(!user)
    if (!user) {
      let err = new Error();
      err.message = "No user found with this email ID",
      err.status = 404;
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
  createUser: async ({ userData }, req) => {
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
      return {
        ID: user._id.toString(),
        email,
        lastName,
        firstName,
        address,
      };
    } catch (error) {
      console.log('err ', error);
    }
  },
  removeUser: async ({ email }, req) => {
    try {
      let user = await User.findOne({ email });
      if (!user) return { message: `No user found with email: ${email}` };
      user.remove();
      return { message: `user removed with email :  ${email}` };
    } catch (error) {}
  },
  updateUser: async ({ userUpdate }, req) => {
    try {
      let updateData = {};
      if (!userUpdate.password && !userUpdate.address)
        return { message: 'please provide the valid input for updation' };
      if (userUpdate.password) updateData.password = userUpdate.password;
      if (userUpdate.address) updateData.address = userUpdate.address;
      console.log('updateData', updateData);
      let result = await User.findOneAndUpdate(
        { email: userUpdate.email },
        updateData
      );
      return { message: `User updated for email Id : ${userUpdate.email}` };
    } catch (error) {
      console.log('err ', error);
    }
  },
};
