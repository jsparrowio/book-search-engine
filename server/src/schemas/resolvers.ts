// import user model and authentication functions
import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';

//interfaces to set up object type structures for user, user input, and login 
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

// set up resolvers which handle any query or mutation request send to the server
const resolvers = {
    // me query, which returns the data of the user held in the auth token
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
        // add user, which adds a user to the database using the add user arguments
        addUser: async (_parent: any, { input }: AddUserArgs) => {
            const user = await User.create({ ...input });
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        // login, which checks for the user in the database, matches password, and sends back a new token if the data is correct
        login: async (_parent: any, { email, password }: LoginUserArgs) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('User not found. Was the intention to signup?');
            }
            const pwAuth = await user.isCorrectPassword(password);
            if (!pwAuth) {
                throw new AuthenticationError('Username or password incorrect');
            }
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        // saves a new book to the user object that matches the user on the current token
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
        // removes a book from the user object that matches the user on the current token and a matching bookId
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

// exports resolvers to be used elsewhere
export default resolvers;