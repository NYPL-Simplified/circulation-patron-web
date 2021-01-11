/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { BookList } from "./BookList";
import Head from "next/head";
import BreadcrumbBar from "./BreadcrumbBar";
import { H3 } from "./Text";
import { AnyBook } from "interfaces";
import PageTitle from "./PageTitle";
import { SignOut } from "./SignOut";
import useUser from "components/context/UserContext";
import { PageLoader } from "components/LoadingIndicator";
import AuthProtectedRoute from "auth/AuthProtectedRoute";

const availableUntil = (book: AnyBook) =>
  book.availability?.until ? new Date(book.availability.until) : "NaN";

function sortBooksByLoanExpirationDate(books: AnyBook[]) {
  return books.sort((a, b) => {
    const aDate = availableUntil(a);
    const bDate = availableUntil(b);
    // if there is no availability info for either, compare their titles
    if (typeof aDate === "string" && typeof bDate === "string") {
      return compareTitles(a, b);
    }
    // if only one has a defined availability, it goes on top
    if (typeof aDate === "string") return 1;
    if (typeof bDate === "string") return -1;
    // if both have defined availabilities, sort by date
    if (aDate < bDate) return -1;
    if (aDate > bDate) return 1;
    // if both dates are the same, sort by title
    return compareTitles(a, b);
  });
}

function compareTitles(a: AnyBook, b: AnyBook): 0 | -1 | 1 {
  if (a.title > b.title) return 1;
  return -1;
}

export const MyBooks: React.FC = () => {
  const { loans, isLoading } = useUser();
  const sortedBooks = loans ? sortBooksByLoanExpirationDate(loans) : [];
  const noBooks = sortedBooks.length === 0;

  return (
    <AuthProtectedRoute>
      <div sx={{ flex: 1, pb: 4 }}>
        <Head>
          <title>My Books</title>
        </Head>

        <BreadcrumbBar currentLocation="My Books" />
        <PageTitle>My Books</PageTitle>
        {noBooks && isLoading ? (
          <PageLoader />
        ) : noBooks ? (
          <Empty />
        ) : (
          <LoansContent books={sortedBooks} />
        )}
      </div>
    </AuthProtectedRoute>
  );
};

const LoansContent: React.FC<{ books: AnyBook[] }> = ({ books }) => {
  return (
    <React.Fragment>
      <BookList books={books} />
    </React.Fragment>
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

export default MyBooks;
