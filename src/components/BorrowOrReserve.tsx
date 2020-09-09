/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

import { BookData, FulfillmentLink } from "opds-web-client/lib/interfaces";
import useBorrow from "hooks/useBorrow";
import Button from "./Button";
import { Text } from "./Text";

const BorrowOrReserve: React.FC<{
  book: BookData;
  isBorrow: boolean;
  borrowLink: FulfillmentLink;
}> = ({ book, isBorrow, borrowLink }) => {
  const {
    isLoading,
    loadingText,
    buttonLabel,
    borrowOrReserve,
    errorMsg
  } = useBorrow(book, isBorrow, borrowLink);
  return (
    <>
      <Button
        size="lg"
        onClick={() => borrowOrReserve(borrowLink.url)}
        loading={isLoading}
        loadingText={loadingText}
      >
        <Text variant="text.body.bold">{buttonLabel}</Text>
      </Button>
      {errorMsg && <Text sx={{ color: "ui.error" }}>Error: {errorMsg}</Text>}
    </>
  );
};

export default BorrowOrReserve;
