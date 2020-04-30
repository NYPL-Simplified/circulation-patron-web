/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import useSetCollectionAndBook from "../hooks/useSetCollectionAndBook";
import { connect } from "react-redux";
import {
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
} from "opds-web-client/lib/components/mergeRootProps";
import { SetCollectionAndBook } from "../interfaces";
import useAuth from "../hooks/useAuth";
import Button from "./Button";
import useTypedSelector from "../hooks/useTypedSelector";
import { ListView, GalleryView } from "./BookList";
import { PageLoader } from "./LoadingIndicator";
import useView from "./context/ViewContext";
import Head from "next/head";

export const MyBooks: React.FC<{
  setCollectionAndBook: SetCollectionAndBook;
}> = ({ setCollectionAndBook }) => {
  // here we pass in "loans" to make it look like we are at /collection/loans
  // which is what used to be the route that is now /loans (ie. this page)
  useSetCollectionAndBook(setCollectionAndBook, "loans");
  const collection = useTypedSelector(state => state.collection);

  const { view } = useView();

  const { isSignedIn, signOutAndGoHome } = useAuth();

  if (collection.isFetching) {
    return <PageLoader />;
  }
  if (!isSignedIn)
    return (
      <div
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column"
        }}
      >
        <Head>
          <title>My Books</title>
        </Head>
        <Styled.h4>You need to be signed in to view this page.</Styled.h4>
      </div>
    );
  if (collection.data?.books && collection.data.books.length > 0) {
    const signOutButton = (
      <Button aria-label="Sign out and go home" onClick={signOutAndGoHome}>
        Sign out
      </Button>
    );
    return (
      <React.Fragment>
        <Head>
          <title>My Books</title>
        </Head>
        {view === "LIST" ? (
          <ListView
            books={collection.data?.books}
            showBorrowButton
            breadcrumb={signOutButton}
          />
        ) : (
          <GalleryView
            books={collection.data.books}
            showBorrowButton
            breadcrumb={signOutButton}
          />
        )}
      </React.Fragment>
    );
  }

  // otherwise you have no loans / holds
  return (
    <div
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}
    >
      <Head>
        <title>My Books</title>
      </Head>
      <Styled.h3 sx={{ color: "primaries.medium" }}>
        Your books will show up here when you have any loaned or on hold.
      </Styled.h3>
      <Button onClick={signOutAndGoHome}>Sign Out</Button>
    </div>
  );
};

const Connected = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(MyBooks);
export default Connected;
