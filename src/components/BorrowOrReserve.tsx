/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useBorrow from "hooks/useBorrow";
import Button from "./Button";
import { Text } from "./Text";

const BorrowOrReserve: React.FC<{
  isBorrow: boolean;
  url: string;
  className?: string;
}> = ({ isBorrow, url, className }) => {
  const {
    isLoading,
    loadingText,
    buttonLabel,
    borrowOrReserve,
    error
  } = useBorrow(isBorrow);
  return (
    <div className={className}>
      <Button
        onClick={() => borrowOrReserve(url)}
        loading={isLoading}
        loadingText={loadingText}
      >
        {buttonLabel}
      </Button>
      {error && <Text sx={{ color: "ui.error" }}>Error: {error}</Text>}
    </div>
  );
};

export default BorrowOrReserve;
