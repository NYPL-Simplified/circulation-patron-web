/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { connect } from "react-redux";
import {
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
} from "opds-web-client/lib/components/mergeRootProps";
import useAuth from "../hooks/useAuth";
import { ListView } from "./BookList";
import Head from "next/head";
import BreadcrumbBar from "./BreadcrumbBar";
import { H3 } from "./Text";
import { BookData } from "opds-web-client/lib/interfaces";
import PageTitle from "./PageTitle";
import SignOut from "./SignOut";
import useSWR from "swr";
import useLibraryContext from "components/context/LibraryContext";
import { fetchCollection } from "dataflow/opds1/fetch";
import { PageLoader } from 'components/LoadingIndicator';

const availableUntil = (book: BookData) =>
  book.availability?.until ? new Date(book.availability.until) : "NaN";

function sortBooksByLoanExpirationDate(books: BookData[]) {
  return books.sort((a, b) => {
    const aDate = availableUntil(a);
    const bDate = availableUntil(b);
    if (typeof aDate === "string") return 1;
    if (typeof bDate === "string") return -1;
    if (aDate <= bDate) return -1;
    return 1;
  });
}

export const MyBooks: React.FC = () => {
  const { shelfUrl } = useLibraryContext();
  const { data: collection, isValidating } = useSWR(shelfUrl, fetchCollection);

  const { isSignedIn } = useAuth();

  const books =
    collection?.books && collection.books.length > 0 && collection.books;
  const sortedBooks = books ? sortBooksByLoanExpirationDate(books) : [];

  return (
    <div sx={{ bg: "ui.gray.lightWarm", flex: 1, pb: 4 }}>
      <Head>
        <title>My Books</title>
      </Head>

      <BreadcrumbBar currentLocation="My Books" />
      <PageTitle>My Books</PageTitle>
      {isValidating ? (
        <PageLoader />
      ) : !isSignedIn ? (
        <Unauthorized />
      ) : books ? (
        <LoansContent books={sortedBooks} />
      ) : (
        <Empty />
      )}
    </div>
  );
};

const LoansContent: React.FC<{ books: BookData[] }> = ({ books }) => {
  return (
    <React.Fragment>
      <ListView books={books} />
    </React.Fragment>
  );
};

const Unauthorized = () => {
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
      <h4>You need to be signed in to view this page.</h4>
    </div>
  );
};

const Empty = () => {
  return (
    <>
      <div
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          px: [3, 5]
        }}
      >
        <H3>
          Your books will show up here when you have any loaned or on hold.
        </H3>
        <SignOut />
      </div>
    </>
  );
};

const Connected = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(MyBooks);
export default Connected;
