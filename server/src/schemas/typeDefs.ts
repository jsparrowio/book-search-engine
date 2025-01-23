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
    authors: [String]!
    description: String!
    title: String!
    image: String!
    link: String!
}

type Auth {
    token: ID!
    user: User
}

type Query {
    me: User
}

type Mutation {
    login(email: String!, password: String!): Auth
    addUser(input: UserInput!): Auth
    saveBook(input: BookInput!): User
    removeBook(bookId: ID!): User
}
`;

export default typeDefs;