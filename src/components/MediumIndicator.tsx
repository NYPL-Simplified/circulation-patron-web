/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { BookData } from "opds-web-client/lib/interfaces";
import { Text } from "./Text";
import { getMedium } from "opds-web-client/lib/utils/book";
import { bookMediumMap } from "utils/book";

const MediumIndicator: React.FC<{ book: BookData; className?: string }> = ({
  book,
  className
}) => {
  const medium = getMedium(book);

  if (Object.keys(bookMediumMap).indexOf(medium) === -1) return null;
  if (medium === "") return null;
  const mediumInfo = bookMediumMap[medium];
  return (
    <Text sx={{ display: "flex", alignItems: "center" }} className={className}>
      <MediumIcon sx={{ mr: 1 }} book={book} />
      {mediumInfo.name}
    </Text>
  );
};

export default MediumIndicator;

export const MediumIcon: React.FC<{ book: BookData; className?: string }> = ({
  book,
  className,
  ...rest
}) => {
  const medium = getMedium(book);

  if (Object.keys(bookMediumMap).indexOf(medium) === -1) return null;
  if (medium === "") return null;
  const mediumInfo = bookMediumMap[medium];
  const MediumSvg = mediumInfo.icon;
  return MediumSvg ? <MediumSvg className={className} {...rest} /> : null;
};
