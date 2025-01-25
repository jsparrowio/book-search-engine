import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';

interface User {
    _id: string;
    username: string;
    email: string;
    savedBooks?: any[];
}
interface AddUserArgs {
    input: {
        username: string;
        email: string;
        password: string;
    }
}
interface LoginUserArgs {
    email: string;
    password: string;
}

const resolvers = {
    Query: {
        Me: async (_parent: any, _args: any, context: any) => {
            if (context.user) {
              const userData = await User.findById(context.user._id).select('-__v -password');
              return userData;
            }
            throw new AuthenticationError('Not logged in');
          },
    },
    Mutation: {
        addUser: async (_parent: any, { input }: AddUserArgs) => {
            const user = await User.create({ ...input });
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        login: async (_parent: any, { email, password }: LoginUserArgs) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('User not found. Did they mean to signup?');
            }
            const pwAuth = await user.isCorrectPassword(password);
            if (!pwAuth) {
                throw new AuthenticationError('Username or password incorrect');
            }
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        saveBook: async (_parent: any, { input }: any, context: any) => {
            if (!context.user) throw new AuthenticationError('You must be logged in');
            try {
                console.log(`Saving new book under BookId ${input.bookId} for user ${context.user._id}`)
                const updatedUser = await User.findByIdAndUpdate(
                    context.user._id,
                    { $addToSet: { savedBooks: input } },
                    { new: true, runValidators: true }
                );
                console.log("Book saved!")
                return updatedUser;
            } catch (err) {
                console.error(err);
                throw new Error('Error saving book');
            }
        },
        removeBook: async (_parent: any, { bookId }: any, context: any) => {
            if (!context.user) throw new Error('You must be logged in');
            try {
                console.log(`Removing book ${bookId} for user ${context.user._id}`)
                const updatedUser = await User.findByIdAndUpdate(
                    context.user._id,
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                console.log("Book removed!")
                return updatedUser;
            } catch (err) {
                console.error(err);
                throw new Error('Error removing book');
            }
        },
    },
};

export default resolvers;