const User = require('./usermodel'); // Make sure to import your User model

const resolvers = {
  Query: {
    users: async (_, { page = 1, pageSize = 10, sortBy = '_id' }) => {
      // Apply pagination and sorting here
      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      const sortCriteria = { [sortBy]: 1 }; // Example sorting criteria, change as needed
      try {
        const sortedUsers = await User.find().sort(sortCriteria).skip(startIdx).limit(pageSize);
        return sortedUsers;
      } catch (error) {
        throw new Error('Failed to fetch users');
      }
    },
    user: async (_, {id:_id}) => {
      try {
        return await User.findById(_id);
      } catch (error) {
        throw new Error('User not found');
      }
    },
  },

  Mutation: {
    createUser: async (_, { username, email, password }) => {
      try {
        const user = new User({ username, email, password });
        await user.save();
        return user;
      } catch (error) {
        throw new Error('Failed to create a user');
      }
    },
    updateUser: async (_, {id:_id, ...rest }) => {
      try {
        const updatedUser = await User.findByIdAndUpdate(_id, rest, { new: true });
        if (!updatedUser) {
          throw new Error('User not found');
        }
        return updatedUser;
      } catch (error) {
        throw new Error('Failed to update user');
      }
    },
    deleteUser: async (_, {id:_id}) => {
      try {
        const deletedUser = await User.findByIdAndRemove(_id);
        if (!deletedUser) {
          throw new Error('User not found');
        }
        return deletedUser;
      } catch (error) {
        throw new Error('Failed to delete user');
      }
    },
  },
};

module.exports = resolvers;
