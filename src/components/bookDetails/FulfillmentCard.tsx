/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import {
  bookIsBorrowable,
  bookIsReservable,
  bookIsReserved,
  bookIsOnHold,
  bookIsFulfillable
} from "utils/book";
import withErrorBoundary from "../ErrorBoundary";
import Stack from "components/Stack";
import { Text } from "components/Text";
import BorrowOrReserve from "components/BorrowOrReserve";
import FulfillmentButton from "components/FulfillmentButton";
import {
  getFulfillmentsFromBook,
  shouldRedirectToCompanionApp
} from "utils/fulfill";
import BookStatus from "components/BookStatus";
import { AnyBook, FulfillableBook, FulfillmentLink } from "interfaces";
import CancelOrReturn from "components/CancelOrReturn";

const FulfillmentCard: React.FC<{ book: AnyBook }> = ({ book }) => {
  return (
    <div
      aria-label="Borrow and download card"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        color: "ui.gray.extraDark"
      }}
    >
      <Stack direction="column" sx={{ my: 3, alignItems: "flex-start" }}>
        <BookStatus book={book} />
        <FulfillmentContent book={book} />
      </Stack>
    </div>
  );
};

const FulfillmentContent: React.FC<{
  book: AnyBook;
}> = ({ book }) => {
  if (bookIsBorrowable(book)) {
    return <BorrowOrReserve url={book.borrowUrl} isBorrow />;
  }
  if (bookIsReservable(book)) {
    return <BorrowOrReserve url={book.reserveUrl} isBorrow={false} />;
  }
  if (bookIsReserved(book)) {
    return (
      <CancelOrReturn
        url={book.revokeUrl}
        text="Cancel Reservation"
        loadingText="Cancelling..."
        id={book.id}
      />
    );
  }
  if (bookIsOnHold(book)) {
    return <BorrowOrReserve url={book.borrowUrl} isBorrow />;
  }
  if (bookIsFulfillable(book)) {
    return <AccessCard links={book.fulfillmentLinks} book={book} />;
  }
  return (
    <Text>
      This title is not supported in this application, please try another.
    </Text>
  );
};

/**
 * Handles the case where it is ready for access either via openAccessLink or
 * via fulfillmentLink.
 */
const AccessCard: React.FC<{
  book: FulfillableBook;
  links: FulfillmentLink[];
}> = ({ book, links }) => {
  const fulfillments = getFulfillmentsFromBook(book);

  const isFulfillable = fulfillments.length > 0;
  const redirectUser = shouldRedirectToCompanionApp(links);

  return (
    <>
      <CancelOrReturn
        url={book.revokeUrl}
        loadingText="Returning..."
        id={book.id}
        text="Return"
      />
      {isFulfillable && redirectUser && (
        <Text variant="text.body.italic">
          If you would rather read on your computer, you can:
        </Text>
      )}
      {isFulfillable && (
        <Stack sx={{ flexWrap: "wrap" }}>
          {fulfillments.map(details => (
            <FulfillmentButton
              key={details.id}
              details={details}
              book={book}
              isPrimaryAction={!redirectUser}
            />
          ))}
        </Stack>
      )}
    </>
  );
};

export default withErrorBoundary(FulfillmentCard);
