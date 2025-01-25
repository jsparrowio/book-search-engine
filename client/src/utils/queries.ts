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
