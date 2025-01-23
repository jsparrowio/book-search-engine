import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';

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

interface AddBookArgs {
    input: {
        bookId: string;
        authors: string[];
        description: string;
        title: string;
        image: string;
        link: string;
    }
}

interface RemoveBookArgs {
    bookId: string;
}

const resolvers = {
    Query: {
        me: async (_parent: any, _args: any, context: any) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id }).populate('savedBooks');
            }
            throw new AuthenticationError('User not found');
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
        saveBook: async (_parent: any, { input }: AddBookArgs, context: any) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: { ...input } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You must be logged in to perform that action...');
        },
        removeBook: async (_parent: any, { bookId }: RemoveBookArgs, context: any) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } }, 
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You must be logged in to perform that action...');
        },
    },
};

export default resolvers;