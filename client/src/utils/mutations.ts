// import graphQL from Apollo to set up mutations to be used elsewhere
// mutations match server side mutations
import { gql } from '@apollo/client';

// user login mutation
export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

// mutation to create a new user
export const ADD_USER = gql`
  mutation Mutation($input: UserInput!) {
  addUser(input: $input) {
    user {
      username
      _id
    }
    token
  }
}
`;

// mutation to add a book to the user object
export const SAVE_BOOK = gql`
  mutation SaveBook($input: BookInput!) {
    saveBook(input: $input) {
        savedBooks {
            bookId
            authors
            description
            title
            image
            link
        }
    }
  }
`;

// mutation to remove a book from the user object 
export const REMOVE_BOOK = gql`
  mutation RemoveBook($bookId: String!) {
    removeBook(bookId: $bookId) {
        savedBooks {
            bookId
            authors
            description
            title
            image
            link
        }
    }
  }
`;