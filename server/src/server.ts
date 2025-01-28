// import dependencies, including express.js, apollo, express middleware, path for express, authentication token from auth service, schemas, and db connection
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import path from 'path';
import { authenticateToken } from './services/auth.js';
import { typeDefs, resolvers } from './schemas/index.js';
import db from './config/connection.js';

import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// set up express server and apollo server
const app = express();
const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// starts apollo server when called
const startApolloServer = async () => {
  await server.start();

  // use express middleware to set up express server
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // set up graphql to make test queries
  app.use('/graphql', expressMiddleware(server as any,
    {
      context: authenticateToken as any
    }
  ));

  // set up production mode
  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/build')));


    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });
  }

  // set up error message for mongoDB
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));

  // set up app to listen for server requests on whatever port is specified
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

// call the apollo server to start when file is ran in node
startApolloServer();