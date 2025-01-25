// import dependencies, including web tokens, graphQL, and dotenv
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';
dotenv.config();

// authenticates token using JWT
export const authenticateToken = ({ req }: any) => {
  let token = req.body.token || req.query.token || req.headers.authorization;
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  if (!token) {
    console.log('No token was provided');
    return req; 
  }

  try {
    const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '2h' });
    req.user = data; 
  } catch (error: any) {
    console.error('Invalid token:', error.message); 
    req.user = null; 
  }

  return req;
};

// signs a new token using JWT and returns it to the query service
export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey: any = process.env.JWT_SECRET_KEY; 
  return jwt.sign({ data: payload }, secretKey, { expiresIn: '2h' });
};

// sends a graphQL error if authentication doesn't pass
export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: { code: 'UNAUTHENTICATED' }
    });
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
};
