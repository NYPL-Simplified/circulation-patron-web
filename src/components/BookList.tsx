/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { truncateString, stripHTML } from "../utils/string";
import {
  getAuthors,
  bookIsBorrowable,
  bookIsFulfillable,
  bookIsReservable,
  bookIsReserved,
  bookIsOnHold
} from "../utils/book";
import Lane from "./Lane";
import Button, { NavButton } from "./Button";
import LoadingIndicator from "./LoadingIndicator";
import { H2, Text } from "./Text";
import BookCover from "./BookCover";
import BorrowOrReserve from "./BorrowOrReserve";
import { AnyBook, CollectionData, LaneData } from "interfaces";
import { fetchCollection } from "dataflow/opds1/fetch";
import { useSWRInfinite } from "swr";
import useUser from "components/context/UserContext";
import Stack from "components/Stack";
import CancelOrReturn from "components/CancelOrReturn";
import FulfillmentButton from "components/FulfillmentButton";
import {
  getFulfillmentFromLink,
  shouldRedirectToCompanionApp
} from "utils/fulfill";
import { ArrowForward } from "icons";
import BookStatus from "components/BookStatus";
import { APP_CONFIG } from "utils/env";

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
    <ul sx={{ px: [3, 5] }} data-testid="listview-list">
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
        listStyle: "none",
        borderBottom: "1px solid",
        borderColor: "ui.gray.light",
        py: 3
      }}
      aria-label={`Book: ${book.title}`}
    >
      <Stack
        sx={{
          alignItems: "flex-start"
        }}
        spacing={3}
      >
        <BookCover
          book={book}
          sx={{
            flex: ["0 0 100px", "0 0 100px", "0 0 148px"],
            height: [141, 141, 219]
          }}
          showMedium={APP_CONFIG.showMedium}
        />
        <Stack direction="column" sx={{ alignItems: "flex-start" }}>
          <div>
            <H2 sx={{ mb: 0, variant: "text.body.bold", display: "inline" }}>
              {truncateString(book.title, 50)}
            </H2>
            {book.subtitle && (
              <Text variant="callouts.italic" aria-label="Subtitle">
                , {truncateString(book.subtitle, 50)}
              </Text>
            )}
            <Text aria-label="Authors" sx={{ display: "block" }}>
              {getAuthors(book, 2).join(", ")}
              {book.authors?.length &&
                book.authors.length > 2 &&
                ` & ${book.authors?.length - 2} more`}
            </Text>
          </div>

          <BookStatus book={book} />
          <BookListCTA book={book} />
          <Description
            book={book}
            sx={{ display: ["none", "none", "block"] }}
          />
        </Stack>
      </Stack>
      <Description
        book={book}
        sx={{ display: ["block", "block", "none"], mt: 2 }}
      />
    </li>
  );
};

const Description: React.FC<{ book: AnyBook; className?: string }> = ({
  book,
  className
}) => {
  return (
    <div className={className}>
      <Text variant="text.body.italic">
        {truncateString(stripHTML(book.summary ?? ""), 280)}
      </Text>
      <NavButton
        bookUrl={book.url}
        variant="link"
        sx={{ verticalAlign: "baseline", ml: 1 }}
      >
        Read more
      </NavButton>
    </div>
  );
};

const BookListCTA: React.FC<{ book: AnyBook }> = ({ book }) => {
  if (bookIsBorrowable(book)) {
    return <BorrowOrReserve url={book.borrowUrl} isBorrow />;
  }

  if (bookIsReservable(book)) {
    return <BorrowOrReserve url={book.reserveUrl} isBorrow={false} />;
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
    // we will show a fulfillment button if there is only one option
    // and we are not supposed to redirect the user to the companion app
    const showableLinks = book.fulfillmentLinks.filter(
      link => link.supportLevel === "show"
    );
    const shouldRedirectUser = shouldRedirectToCompanionApp(
      book.fulfillmentLinks
    );

    const showableFulfillments = showableLinks.map(getFulfillmentFromLink);
    const singleFulfillment =
      showableFulfillments.length === 1 ? showableFulfillments[0] : undefined;

    if (singleFulfillment && !shouldRedirectUser) {
      return (
        <FulfillmentButton
          details={singleFulfillment}
          book={book}
          isPrimaryAction
        />
      );
    }
    return (
      <NavButton variant="link" bookUrl={book.url} iconRight={ArrowForward}>
        View Book Details
      </NavButton>
    );
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
