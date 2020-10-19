/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import {
  availabilityString,
  queueString,
  bookIsBorrowable,
  bookIsReservable,
  bookIsReserved,
  bookIsOnHold,
  bookIsFulfillable
} from "utils/book";
import withErrorBoundary from "../ErrorBoundary";
import Stack from "components/Stack";
import { Text } from "components/Text";
import { MediumIcon } from "components/MediumIndicator";
import SvgPhone from "icons/Phone";
import BorrowOrReserve from "components/BorrowOrReserve";
import FulfillmentButton from "components/FulfillmentButton";
import {
  getFulfillmentsFromBook,
  shouldRedirectToCompanionApp
} from "utils/fulfill";
import {
  AnyBook,
  FulfillableBook,
  FulfillmentLink,
  ReservedBook
} from "interfaces";
import { APP_CONFIG } from "config";
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
      <FulfillmentContent book={book} />
    </div>
  );
};

const FulfillmentContent: React.FC<{
  book: AnyBook;
}> = ({ book }) => {
  if (bookIsBorrowable(book)) {
    return (
      <BorrowOrReserveBlock
        title="Available to borrow"
        subtitle={
          <>
            <MediumIcon book={book} sx={{ mr: 1 }} /> {availabilityString(book)}
          </>
        }
        url={book.borrowUrl}
        isBorrow={true}
      />
    );
  }

  if (bookIsReservable(book)) {
    return (
      <BorrowOrReserveBlock
        title="Unavailable"
        subtitle={
          <>
            <MediumIcon book={book} sx={{ mr: 1 }} /> {availabilityString(book)}
            {typeof book.holds?.total === "number" &&
              ` ${book.holds.total} patrons in the queue.`}
          </>
        }
        url={book.reserveUrl}
        isBorrow={false}
      />
    );
  }

  if (bookIsReserved(book)) {
    return <Reserved book={book} />;
  }

  if (bookIsOnHold(book)) {
    const availableUntil = book.availability?.until
      ? new Date(book.availability.until).toDateString()
      : "NaN";

    const title = "On Hold";
    const subtitle =
      availableUntil !== "NaN"
        ? `Your hold will expire on ${availableUntil}. ${queueString(book)}`
        : "You must borrow this book before your loan expires.";

    return (
      <BorrowOrReserveBlock
        title={title}
        subtitle={subtitle}
        url={book.borrowUrl}
        isBorrow={true}
      />
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
      <AccessCard
        links={book.fulfillmentLinks}
        book={book}
        subtitle={subtitle}
      />
    );
  }

  return <Unsupported />;
};

const BorrowOrReserveBlock: React.FC<{
  title: string;
  subtitle: React.ReactNode;
  isBorrow: boolean;
  url: string;
}> = ({ title, subtitle, isBorrow, url }) => {
  return (
    <Stack direction="column" spacing={0} sx={{ my: 3 }}>
      <Text variant="text.body.bold">{title}</Text>
      <Text>{subtitle}</Text>
      <BorrowOrReserve url={url} isBorrow={isBorrow} />
    </Stack>
  );
};

const Reserved: React.FC<{ book: ReservedBook }> = ({ book }) => {
  const position = book.holds?.position;

  return (
    <Stack direction="column" spacing={0} sx={{ my: 3 }}>
      <Text variant="text.callouts.bold">Reserved</Text>
      {!!position && (
        <Text
          variant="text.body.italic"
          sx={{ display: "inline-flex", alignItems: "center" }}
        >
          <MediumIcon book={book} sx={{ mr: 1 }} />
          Your hold position is: {position}.
        </Text>
      )}
      <CancelOrReturn
        url={book.revokeUrl}
        text="Cancel Reservation"
        loadingText="Cancelling..."
        id={book.id}
      />
    </Stack>
  );
};

const Unsupported: React.FC = () => {
  return (
    <Stack direction="column" spacing={0} sx={{ my: 3 }}>
      <Text variant="text.body.bold">Unsupported</Text>
      <Text>
        This title is not supported in this application, please try another.
      </Text>
    </Stack>
  );
};

/**
 * Handles the case where it is ready for access either via openAccessLink or
 * via fulfillmentLink.
 */
const AccessCard: React.FC<{
  book: FulfillableBook;
  links: FulfillmentLink[];
  subtitle: string;
}> = ({ book, links, subtitle }) => {
  const fulfillments = getFulfillmentsFromBook(book);

  const isFulfillable = fulfillments.length > 0;
  const redirectUser = shouldRedirectToCompanionApp(links);

  const companionApp =
    APP_CONFIG.companionApp === "openebooks" ? "Open eBooks" : "SimplyE";

  return (
    <Stack direction="column" sx={{ my: 3, alignItems: "flex-start" }}>
      <Stack spacing={0} direction="column">
        <Stack>
          {redirectUser && <SvgPhone sx={{ fontSize: 24 }} />}
          <Text variant="text.body.bold">
            Ready to read{redirectUser ? ` in ${companionApp}` : ""}!
          </Text>
        </Stack>
        <Text>{subtitle}</Text>
      </Stack>
      <CancelOrReturn
        url={book.revokeUrl}
        loadingText="Returning..."
        id={book.id}
        text="Return"
      />
      {isFulfillable && (
        <>
          {redirectUser && (
            <Text variant="text.body.italic">
              If you would rather read on your computer, you can:
            </Text>
          )}
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
        </>
      )}
    </Stack>
  );
};

export default withErrorBoundary(FulfillmentCard);
