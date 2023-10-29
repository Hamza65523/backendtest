const User = require('./usermodel'); 
const Redis = require('ioredis');
const redisConfig = {
  port: 6379,
  host: '127.0.0.1',
};

const redis = new Redis(redisConfig);


const resolvers = {
  Query: {
    users: async (_, { page = 1, pageSize = 10, sortBy = '_id' }) => {
      const cachedResult = await redis.get('users');
      if (cachedResult) {
        return cachedResult;
      } else {
      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      const sortCriteria = { [sortBy]: 1 };
      try {
        const sortedUsers = await User.find().sort(sortCriteria).skip(startIdx).limit(pageSize);
        await redis.set('users', sortedUsers, 'EX', 3600);
        return sortedUsers;
      } catch (error) {
        throw new Error('Failed to fetch users');
      }
     
    }
    },
    user: async (_, { id:_id }) => {
      try {
        const cachedResult = await redis.get('user');
        if (cachedResult) {
          return cachedResult;
        } else {
          const  user =await User.findById(_id);
          await redis.set('user', user, 'EX', 3600);
          return user;
        }
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
    updateUser: async (_, { id:_id, ...rest }) => {
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
    deleteUser: async (_, { id:_id }) => {
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
