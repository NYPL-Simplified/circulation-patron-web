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
import MediumIndicator, { MediumIcon } from "components/MediumIndicator";
import { ArrowForward } from "icons";
import BookCover from "./BookCover";
import BorrowOrReserve from "./BorrowOrReserve";
import {
  AnyBook,
  CollectionData,
  FulfillableBook,
  LaneData,
  OnHoldBook,
  ReservableBook,
  ReservedBook
} from "interfaces";
import { fetchCollection } from "dataflow/opds1/fetch";
import { useSWRInfinite } from "swr";
import ApplicationError from "errors";
import useUser from "components/context/UserContext";
import { APP_CONFIG } from "config";
import Stack from "components/Stack";
import { book as bookFix, mergeBook } from "test-utils/fixtures/book";
import CancelOrReturn from "components/CancelOrReturn";

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

const book = mergeBook<FulfillableBook>({
  ...bookFix,
  status: "fulfillable",
  revokeUrl: "/borrow",
  fulfillmentLinks: []
});

export const BookListItem: React.FC<{
  book: AnyBook;
}> = ({ book: collectionBook }) => {
  const { loans } = useUser();
  // if the book exists in loans, use that version
  // const loanedBook = loans?.find(loan => loan.id === collectionBook.id);
  // const book = loanedBook ?? collectionBook;
  return (
    <li
      sx={{
        listStyle: "none"
      }}
      aria-label={`Book: ${book.title}`}
    >
      <Stack
        sx={{
          alignItems: "flex-start",
          borderBottom: "1px solid",
          borderColor: "ui.gray.light",
          py: 3
        }}
        spacing={3}
      >
        <BookCover book={book} sx={{ flex: "0 0 148px", height: 219 }} />
        <Stack direction="column" sx={{ alignItems: "flex-start" }}>
          <H2 sx={{ mb: 0, variant: "text.body.bold" }}>
            {truncateString(book.title, 50)}
          </H2>
          {book.subtitle && (
            <Text variant="callouts.italic" aria-label="Subtitle">
              {truncateString(book.subtitle, 50)}
            </Text>
          )}
          <Text aria-label="Authors">
            {getAuthors(book, 2).join(", ")}
            {book.authors?.length &&
              book.authors.length > 2 &&
              ` & ${book.authors?.length - 2} more`}
          </Text>
          {APP_CONFIG.showMedium && (
            <MediumIndicator book={book} sx={{ color: "ui.gray.dark" }} />
          )}
          <BookStatus book={book} />
          <BookListCTA book={book} />
          <Text
            variant="text.body.italic"
            dangerouslySetInnerHTML={{
              __html: truncateString(stripHTML(book.summary ?? ""), 280)
            }}
          ></Text>
          {/* <NavButton
              variant="link"
              bookUrl={book.url}
              iconRight={ArrowForward}
            >
              View Book Details
            </NavButton> */}
        </Stack>
      </Stack>
    </li>
  );
};

const BookStatus: React.FC<{ book: AnyBook }> = ({ book }) => {
  const { status } = book;
  const str =
    status === "borrowable"
      ? "Available to borrow"
      : status === "reservable"
      ? "Unavailable"
      : status === "reserved"
      ? "Reserved"
      : status === "on-hold"
      ? "Ready to Borrow"
      : status === "fulfillable"
      ? "Ready to Read!"
      : "Unsupported";
  return (
    <div>
      <div sx={{ display: "flex", alignItems: "center" }}>
        <MediumIcon book={book} sx={{ mr: 1 }} />
        <Text variant="text.body.bold">{str}</Text>
      </div>
      <AvailabilityString book={book} />
    </div>
  );
};

const AvailabilityString: React.FC<{ book: AnyBook }> = ({ book }) => {
  const str = availabilityString(book);
  if (!str) return null;
  return (
    <Text
      variant="text.body.italic"
      sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
    >
      {str}
    </Text>
  );
};

const BookListCTA: React.FC<{ book: AnyBook }> = ({ book }) => {
  if (bookIsBorrowable(book)) {
    return <BorrowOrReserve url={book.borrowUrl} isBorrow sx={{ my: 2 }} />;
  }

  if (bookIsReservable(book)) {
    return (
      <>
        <BookStatus book={book} />
        <BorrowOrReserve url={book.reserveUrl} isBorrow={false} />
      </>
    );
  }

  if (bookIsOnHold(book)) {
    return <BorrowOrReserve url={book.borrowUrl} isBorrow />;
  }

  if (bookIsReserved(book)) {
    return (
      <CancelOrReturn
        url={book.revokeUrl}
        id={book.id}
        text="Cancel Reservation"
        loadingText="Cancelling..."
      />
    );
  }

  if (bookIsFulfillable(book)) {
    return <div>hi</div>;
  }

  return null;
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
