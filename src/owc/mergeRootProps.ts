import { AuthCredentials } from "hooks/useAuth";
import DataFetcher from "owc/DataFetcher";
import { AuthCallback } from "owc/interfaces";
import { adapter } from "owc/OPDSDataAdapter";
import ActionsCreator from "owc/actions";
import { BookData, CollectionData } from "interfaces";

export function findBookInCollection(
  collection: CollectionData | null,
  book: string
) {
  if (collection) {
    const allBooks = collection.lanes.reduce((books, lane) => {
      return books.concat(lane.books);
    }, collection.books);

    return allBooks.find(b => b.url === book || b.id === book);
  } else {
    return null;
  }
}

export function mapStateToProps(state: any, ownProps: any) {
  return {
    collectionData: state.collection.data || ownProps.collectionData,
    isFetchingCollection: state.collection.isFetching,
    isFetchingPage: state.collection.isFetchingPage,
    isFetchingBook: state.book.isFetching,
    error: state.collection.error || state.book.error,
    bookData: state.book.data || ownProps.bookData,
    history: state.collection.history,
    loadedCollectionUrl: state.collection.url,
    loadedBookUrl: state.book.url,
    collectionUrl: ownProps.collectionUrl,
    bookUrl: ownProps.bookUrl,
    loansUrl: state.loans.url,
    loans: state.loans.books,
    auth: state.auth,
    isSignedIn: !!state.auth.credentials,
    preferences: state.preferences
  };
}

export function mapDispatchToProps(dispatch: any) {
  return {
    createDispatchProps: (fetcher: any) => {
      const actions = new ActionsCreator(fetcher);
      return {
        fetchCollection: (url: string) =>
          dispatch(actions.fetchCollection(url)),
        fetchPage: (url: string) => dispatch(actions.fetchPage(url)),
        fetchBook: (url: string) => dispatch(actions.fetchBook(url)),
        loadBook: (book: BookData, url: string) =>
          dispatch(actions.loadBook(book, url)),
        clearCollection: () => dispatch(actions.clearCollection()),
        clearBook: () => dispatch(actions.clearBook()),
        fetchSearchDescription: (url: string) =>
          dispatch(actions.fetchSearchDescription(url)),
        closeError: () => dispatch(actions.closeError()),
        updateBook: (url: string) => dispatch(actions.updateBook(url)),
        fulfillBook: (url: string) => dispatch(actions.fulfillBook(url)),
        indirectFulfillBook: (url: string, type: string) =>
          dispatch(actions.indirectFulfillBook(url, type)),
        fetchLoans: (url: string) => dispatch(actions.fetchLoans(url)),
        saveAuthCredentials: (credentials: AuthCredentials) =>
          dispatch(actions.saveAuthCredentials(credentials)),
        clearAuthCredentials: () => dispatch(actions.clearAuthCredentials()),
        showAuthForm: (
          callback: AuthCallback,
          cancel: () => void,
          providers: any,
          title: string
        ) => dispatch(actions.showAuthForm(callback, cancel, providers, title)),
        closeErrorAndHideAuthForm: () =>
          dispatch(actions.closeErrorAndHideAuthForm()),
        setPreference: (key: string, value: string) =>
          dispatch(actions.setPreference(key, value))
      };
    }
  };
}

// only used by a server when it needs to fetch collection and/or book data
// for a particular route into a store before it renders to HTML
export function createFetchCollectionAndBook(dispatch: any) {
  const fetcher = new DataFetcher({ adapter });
  const actions = mapDispatchToProps(dispatch).createDispatchProps(fetcher);
  const { fetchCollection, fetchBook } = actions;
  return (
    collectionUrl: string | undefined | null,
    bookUrl?: string | null
  ): Promise<{
    collectionData: CollectionData | null;
    bookData: BookData | null;
  }> => {
    return fetchCollectionAndBook({
      fetchCollection,
      fetchBook,
      collectionUrl,
      bookUrl
    });
  };
}

export function fetchCollectionAndBook({
  fetchCollection,
  fetchBook,
  collectionUrl,
  bookUrl
}: any): Promise<{
  collectionData: CollectionData | null;
  bookData: BookData | null;
}> {
  return new Promise((resolve, reject) => {
    if (collectionUrl) {
      fetchCollection(collectionUrl)
        .then((collectionData: any) => {
          if (bookUrl) {
            fetchBook(bookUrl)
              .then((bookData: any) => {
                resolve({ collectionData, bookData });
              })
              .catch((err: any) => reject(err));
          } else {
            resolve({ collectionData, bookData: null });
          }
        })
        .catch((err: any) => reject(err));
    } else if (bookUrl) {
      fetchBook(bookUrl)
        .then((bookData: any) => {
          resolve({ collectionData: null, bookData });
        })
        .catch((err: any) => reject(err));
    } else {
      resolve({ collectionData: null, bookData: null });
    }
  });
}

export function mergeRootProps(
  stateProps: any,
  createDispatchProps: any,
  componentProps: any
) {
  const fetcher = new DataFetcher({
    proxyUrl: componentProps.proxyUrl,
    adapter: adapter
  });
  const dispatchProps = createDispatchProps.createDispatchProps(fetcher);
  const authCredentials = fetcher.getAuthCredentials();

  const setCollection = (
    url: string | null
  ): Promise<CollectionData | null> => {
    return new Promise((resolve, _reject) => {
      if (url === stateProps.loadedCollectionUrl) {
        // if url is same, do nothing unless there's currently error
        if (stateProps.error) {
          dispatchProps.fetchCollection(url).then((data: any) => resolve(data));
        } else {
          resolve(stateProps.collectionData);
        }
      } else {
        // if url is changed, either fetch or clear collection
        if (url) {
          dispatchProps.fetchCollection(url).then((data: any) => resolve(data));
        } else {
          dispatchProps.clearCollection();
          resolve(null);
        }
      }
    });
  };

  const setBook = (
    book: BookData | string | null,
    collectionData: CollectionData | null = null
  ): Promise<BookData | null> => {
    return new Promise((resolve, _reject) => {
      let url: string | null = null;
      let bookData: BookData | null = null;

      if (typeof book === "string") {
        url = book;
        bookData = findBookInCollection(collectionData, url) ?? null;
      } else if (book && typeof book === "object") {
        url = book.url ?? null;
        bookData = book;
      }

      if (bookData) {
        dispatchProps.loadBook(bookData, url);
        resolve(bookData);
      } else if (url) {
        dispatchProps.fetchBook(url).then((data: any) => resolve(data));
      } else {
        dispatchProps.clearBook();
        resolve(null);
      }
    });
  };

  const setCollectionAndBook = (collectionUrl: string, bookUrl: string) => {
    return new Promise((resolve, reject) => {
      setCollection(collectionUrl)
        .then((collectionData: CollectionData | null) => {
          setBook(bookUrl, collectionData)
            .then((bookData: BookData | null) => {
              resolve({ collectionData, bookData });
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  };

  const { fetchCollection, fetchBook } = dispatchProps;

  const updateBook = (url: string) => {
    return dispatchProps.updateBook(url).then((data: any) => {
      if (stateProps.loansUrl) {
        dispatchProps.fetchLoans(stateProps.loansUrl);
      }

      return data;
    });
  };

  return Object.assign({}, componentProps, stateProps, dispatchProps, {
    authCredentials: authCredentials,
    setCollection: setCollection,
    setBook: setBook,
    setCollectionAndBook: setCollectionAndBook,
    refreshCollectionAndBook: () => {
      return fetchCollectionAndBook({
        fetchCollection,
        fetchBook,
        collectionUrl: stateProps.loadedCollectionUrl,
        bookUrl: stateProps.loadedBookUrl
      });
    },
    retryCollectionAndBook: () => {
      const { collectionUrl, bookUrl } = stateProps;
      return fetchCollectionAndBook({
        fetchCollection,
        fetchBook,
        collectionUrl,
        bookUrl
      });
    },
    clearCollection: () => {
      setCollection(null);
    },
    clearBook: () => {
      setBook(null);
    },
    updateBook: updateBook
  });
}
