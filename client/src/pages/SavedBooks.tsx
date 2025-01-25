import { useQuery, useMutation } from '@apollo/client';

import { Container, Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import Auth from '../utils/auth';
import { Book } from '../models/Book';
import { QUERY_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import { useEffect } from 'react';


const SavedBooks = () => {

  const { loading, data, refetch } = useQuery(QUERY_ME);
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);

  const userData = data?.Me || {};

  useEffect(() => { refetch() }, [userData])

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await removeBook({
        variables: { bookId: bookId },
      });
      // if book successfully saves to user's account, save book id to state
      refetch();
    } catch (err) {
      console.error(err);
    }

  };

  // if data isn't here yet, say so
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center pt-5">
        <Spinner animation="border" role="status" />
        <span className="ms-2">Loading...</span>
      </div>
    )
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'
            }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book: Book) => {
            return (
              <Col key={book.bookId} md='4'>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
        {error && (
          <div className="col-12 my-3 bg-danger text-white p-3">
            {error.message}
          </div>
        )}
      </Container>
    </>
  );
};

export default SavedBooks;
