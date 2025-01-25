// set up type definitions for GraphQL/Apollo
// also sets up input types, queries, and mutations, which allow for the modification of data in the database
const typeDefs = `
type User {
    _id: ID
    username: String
    email: String
    password: String
    savedBooks: [Book]!
}

input UserInput {
    username: String!
    email: String!
    password: String!
}

type Book {
    bookId: String
    authors: [String]
    description: String
    title: String
    image: String
    link: String
}

  input BookInput {
    bookId: String!
    title: String!
    authors: [String]
    description: String
    image: String
    link: String
  }

type Auth {
    token: ID!
    user: User!
}

type Query {
    Me: User
}

type Mutation {
    login(email: String!, password: String!): Auth
    addUser(input: UserInput!): Auth
    saveBook(input: BookInput!): User
    removeBook(bookId: String!): User
}
`;

// export typeDefs to be used elsewhere
export default typeDefs;