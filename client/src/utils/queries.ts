// import graphQL from Apollo to set up quieries to be used elsewhere
// queries match server side mutations
import { gql } from '@apollo/client';

export const QUERY_ME = gql`
  query Me {
    Me {
      _id
      username
      email
      savedBooks {
        bookId
        title
        authors
        description
        image
        link
      }
    }
  }
`;
