/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useBorrow from "hooks/useBorrow";
import Button from "./Button";
import { Text } from "./Text";
import Stack from "components/Stack";

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
    <Stack
      direction="column"
      sx={{ alignItems: "flex-start" }}
      className={className}
    >
      <Button
        onClick={() => borrowOrReserve(url)}
        loading={isLoading}
        loadingText={loadingText}
      >
        {buttonLabel}
      </Button>
      {error && <Text sx={{ color: "ui.error" }}>{error}</Text>}
    </Stack>
  );
};

export default BorrowOrReserve;
