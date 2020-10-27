/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { MediumIcon } from "components/MediumIndicator";
import { AnyBook } from "interfaces";
import { availabilityString, bookIsFulfillable } from "utils/book";
import { Text } from "components/Text";
import { shouldRedirectToCompanionApp } from "utils/fulfill";
import { APP_CONFIG } from "config";
import SvgPhone from "icons/Phone";

const BookStatus: React.FC<{ book: AnyBook }> = ({ book }) => {
  const { status } = book;

  const redirectUser = bookIsFulfillable(book)
    ? shouldRedirectToCompanionApp(book.fulfillmentLinks)
    : false;

  const companionApp =
    APP_CONFIG.companionApp === "openebooks" ? "Open eBooks" : "SimplyE";

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
      ? `Ready to Read${redirectUser ? ` in ${companionApp}` : ""}!`
      : "Unsupported";

  return (
    <div>
      <div sx={{ display: "flex", alignItems: "center" }}>
        {redirectUser ? (
          <SvgPhone sx={{ fontSize: 24 }} />
        ) : (
          <MediumIcon book={book} sx={{ mr: 1 }} />
        )}
        <Text variant="text.body.bold" sx={{ fontWeight: 600 }}>
          {str}
        </Text>
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

export default BookStatus;
