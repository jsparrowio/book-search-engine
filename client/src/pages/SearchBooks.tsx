// import dependencies, including react, bootsrap, apollo, auth, models, queries, API calls, and mutations
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row,
  Spinner
} from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations';
import { QUERY_ME } from "../utils/queries";
import Auth from '../utils/auth';
import { searchGoogleBooks } from '../utils/API';
import { saveBookIds } from '../utils/localStorage';
import type { Book } from '../models/Book';
import type { GoogleAPIBook } from '../models/GoogleAPIBook';

// search books page/homepage
const SearchBooks = () => {
  // set up queries and mutations, including a loading variable for when we are fetching the user data
  const { data: userData, loading: userLoading } = useQuery(QUERY_ME);
  const [saveBook, { error }] = useMutation(SAVE_BOOK);
  // set up a state for loading while we are retreiving and storing user/savedBook data
  const [loading, setLoading] = useState(true);
  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');
  // create state to hold saved bookId values
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);

  // useEffect to grab all userData if a user exists before we render the page
  // also rerender the page if the userData changes
  // if no userData exists, render the default (not logged in) page
  useEffect(() => {
    setLoading(true);
    if (userData?.Me) {
      const userSavedBookIds = userData.Me.savedBooks.map(
        (book: Book) => book.bookId
      );
      setSavedBookIds(userSavedBookIds);
      saveBookIds(savedBookIds);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [userData]);

  // set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
  // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  useEffect(() => {
    console.log("Updated Saved Book IDs:", savedBookIds);
  }, [savedBookIds]);

  // create method to search for books and set state on form submit
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    // try/catch to search Google Books API, return the bookData and reset the search bar
    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      const { items } = await response.json();

      const bookData = items.map((book: GoogleAPIBook) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
        link: book.volumeInfo.canonicalVolumeLink
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // create function to handle saving a book to our database
  const handleSaveBook = async (bookId: string) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave: Book = searchedBooks.find((book) => book.bookId === bookId)!;

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    // try/catch using the SAVE_BOOK mutation to save the book to the DB
    try {
      console.log('Attempting to save book...')
      await saveBook({
        variables: { input: bookToSave },
      });
      // if book successfully saves to user's account, save book id to state
      console.log("Book saved to user under book ID:", bookToSave.bookId)
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error(err);
    }
  };

  // render the react component to be displayed to the user
  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        {userLoading || loading ? (
          <div className="d-flex justify-content-center align-items-center pt-5">
            <Spinner animation="border" role="status" />
            <span className="ms-2">Loading...</span>
          </div>
        ) : (
          <>
            <h2 className='pt-5'>
              {searchedBooks.length
                ? `Viewing ${searchedBooks.length} results:`
                : 'Search for a book to begin'}
            </h2>
            <Row>
              {searchedBooks.map((book) => {
                return (
                  <Col md="4" key={book.bookId}>
                    <Card border='dark' className='m-1'>
                      {book.image ? (
                        <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                      ) : null}
                      <Card.Body className='text-center'>
                        <Card.Title>{book.title}</Card.Title>
                        <p className='small'>Authors: {book.authors}</p>
                        <Card.Text>{book.description}</Card.Text>
                        {book.link &&
                          <Button
                            className='btn-block btn-info m-1'
                            onClick={() => {
                              window.open(
                                book.link,
                                '_blank'
                              )
                            }}
                          >View Book on Google Books</Button>
                        }
                        {Auth.loggedIn() && (
                          <Button
                            disabled={savedBookIds?.some((savedBookId: string) => savedBookId === book.bookId)}
                            className='btn-block btn-info'
                            onClick={() => handleSaveBook(book.bookId)}>
                            {savedBookIds?.some((savedBookId: string) => savedBookId === book.bookId)
                              ? 'This book has already been saved!'
                              : 'Save this Book!'}
                          </Button>
                        )}
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
          </>
        )}
      </Container>
    </>
  );
};

// export the form to be imported by react
export default SearchBooks;
