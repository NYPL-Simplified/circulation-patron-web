/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { truncateString, stripHTML } from "../utils/string";
import {
  getAuthors,
  availabilityString,
  bookIsBorrowable,
  bookIsFulfillable,
  bookIsReservable,
  bookIsReserved,
  bookIsOnHold,
  bookIsUnsupported
} from "../utils/book";
import Lane from "./Lane";
import Button, { NavButton } from "./Button";
import LoadingIndicator from "./LoadingIndicator";
import { H2, Text } from "./Text";
import * as DS from "@nypl/design-system-react-components";
import MediumIndicator from "components/MediumIndicator";
import { ArrowForward } from "icons";
import BookCover from "./BookCover";
import BorrowOrReserve from "./BorrowOrReserve";
import { AnyBook, CollectionData, LaneData } from "interfaces";
import { fetchCollection } from "dataflow/opds1/fetch";
import { useSWRInfinite } from "swr";
import ApplicationError from "errors";
import useUser from "components/context/UserContext";

const ListLoadingIndicator = () => (
  <div
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: 2,
      fontWeight: "heading",
      p: 3
    }}
  >
    <LoadingIndicator /> Loading ...
  </div>
);

export const InfiniteBookList: React.FC<{ firstPageUrl: string }> = ({
  firstPageUrl
}) => {
  function getKey(pageIndex: number, previousData: CollectionData) {
    // first page, no previous data
    if (pageIndex === 0) return firstPageUrl;
    // reached the end
    if (!previousData.nextPageUrl) return null;
    // otherwise return the next page url
    return previousData.nextPageUrl;
  }
  const { data, size, error, setSize } = useSWRInfinite(
    getKey,
    fetchCollection
  );

  const isFetchingInitialData = !data && !error;
  const lastItem = data && data[data.length - 1];
  const hasMore = !!lastItem?.nextPageUrl;
  const isFetchingMore = !!(!error && hasMore && size > (data?.length ?? 0));
  const isFetching = isFetchingInitialData || isFetchingMore;

  // extract the books from the array of collections in data
  const books =
    data?.reduce(
      (total, current) => [...total, ...(current.books ?? [])],
      []
    ) ?? [];

  return (
    <>
      <BookList books={books} />
      {isFetching ? (
        <ListLoadingIndicator />
      ) : hasMore ? (
        <div sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <Button
            size="lg"
            color="brand.primary"
            onClick={() => setSize(size => size + 1)}
            sx={{ maxWidth: 300 }}
          >
            View more
          </Button>
        </div>
      ) : null}
    </>
  );
};

export const BookList: React.FC<{
  books: AnyBook[];
}> = ({ books }) => {
  return (
    <ul sx={{ px: 5 }} data-testid="listview-list">
      {books.map(book => (
        <BookListItem key={book.id} book={book} />
      ))}
    </ul>
  );
};

export const BookListItem: React.FC<{
  book: AnyBook;
}> = ({ book: collectionBook }) => {
  const { loans } = useUser();
  // if the book exists in loans, use that version
  const loanedBook = loans?.find(loan => loan.id === collectionBook.id);
  const book = loanedBook ?? collectionBook;
  return (
    <li
      sx={{
        listStyle: "none"
      }}
      aria-label={`Book: ${book.title}`}
    >
      <DS.Card
        sx={{ ".card__ctas": { margin: "auto" }, bg: "ui.white" }}
        image={
          <BookCover
            book={book}
            sx={{
              height: "100%",
              width: "100%",
              maxHeight: "100%",
              maxWidth: "100%"
            }}
          />
        }
        ctas={
          <div
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
              textAlign: "center"
            }}
          >
            <BookListCTA book={book} />
          </div>
        }
      >
        <H2 sx={{ mb: 0 }}>{truncateString(book.title, 50)}</H2>
        {book.subtitle && (
          <Text variant="callouts.italic">
            {truncateString(book.subtitle, 50)}
          </Text>
        )}
        by&nbsp;
        <Text>
          {getAuthors(book, 2).join(", ")}
          {book.authors?.length &&
            book.authors.length > 2 &&
            ` & ${book.authors?.length - 2} more`}
        </Text>
        <MediumIndicator book={book} sx={{ color: "ui.gray.dark" }} />
        <div sx={{ mt: 3 }}>
          <Text
            variant="text.body.italic"
            dangerouslySetInnerHTML={{
              __html: truncateString(stripHTML(book.summary ?? ""), 200)
            }}
          ></Text>
        </div>
      </DS.Card>
    </li>
  );
};

const BookListCTA: React.FC<{ book: AnyBook }> = ({ book }) => {
  if (bookIsBorrowable(book)) {
    return (
      <>
        <BorrowOrReserve url={book.borrowUrl} isBorrow />
        <Text
          variant="text.body.italic"
          sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
        >
          {availabilityString(book)}
        </Text>

        <NavButton variant="ghost" bookUrl={book.url} iconRight={ArrowForward}>
          View Book Details
        </NavButton>
      </>
    );
  }

  if (bookIsReservable(book)) {
    return (
      <>
        <BorrowOrReserve url={book.reserveUrl} isBorrow={false} />
        <Text
          variant="text.body.italic"
          sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
        >
          {availabilityString(book)}
        </Text>
        <NavButton variant="ghost" bookUrl={book.url} iconRight={ArrowForward}>
          View Book Details
        </NavButton>
      </>
    );
  }

  if (bookIsReserved(book)) {
    const position = book.holds?.position;
    return (
      <>
        <Button disabled color="ui.black">
          Reserved
        </Button>
        <Text
          variant="text.body.italic"
          sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
        >
          You have this book on hold.{" "}
          {typeof position === "number" &&
            !isNaN(position) &&
            `Position: ${position}`}
        </Text>
        <NavButton variant="ghost" bookUrl={book.url} iconRight={ArrowForward}>
          View Book Details
        </NavButton>
      </>
    );
  }

  if (bookIsOnHold(book)) {
    return (
      <>
        <BorrowOrReserve url={book.borrowUrl} isBorrow />
        <Text
          variant="text.body.italic"
          sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
        >
          You have this book on hold.
        </Text>
        <NavButton variant="ghost" bookUrl={book.url} iconRight={ArrowForward}>
          View Book Details
        </NavButton>
      </>
    );
  }

  if (bookIsFulfillable(book)) {
    const availableUntil = book.availability?.until
      ? new Date(book.availability.until).toDateString()
      : "NaN";

    const subtitle =
      availableUntil !== "NaN"
        ? `You have this book on loan until ${availableUntil}.`
        : "You have this book on loan.";

    return (
      <>
        <Text
          variant="text.body.italic"
          sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
        >
          {subtitle}
        </Text>
        <NavButton variant="ghost" bookUrl={book.url} iconRight={ArrowForward}>
          View Book Details
        </NavButton>
      </>
    );
  }

  if (bookIsUnsupported(book)) {
    return (
      <>
        <Text
          variant="text.body.italic"
          sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
        >
          This book is unsupported.
        </Text>
        <NavButton variant="ghost" bookUrl={book.url} iconRight={ArrowForward}>
          View Book Details
        </NavButton>
      </>
    );
  }
  /**
   * We have covered all possibilities.
   */
  throw new ApplicationError("Encountered a book with impossible state");
};

export const LanesView: React.FC<{ lanes: LaneData[] }> = ({ lanes }) => {
  return (
    <ul sx={{ m: 0, p: 0 }}>
      {lanes.map(lane => (
        <Lane key={lane.url} lane={lane} />
      ))}
    </ul>
  );
};
