/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { getAuthors } from "../utils/book";
import Link from "./Link";
import BookCover from "./BookCover";
import { truncateString } from "../utils/string";
import { Text, H3 } from "./Text";
import { AnyBook } from "interfaces";
import { APP_CONFIG } from "config";

export const BOOK_WIDTH = 187;
export const BOOK_HEIGHT = 365;

const twoLines = 42;

const BookCard = React.forwardRef<
  HTMLLIElement,
  { book: AnyBook; className?: string }
>(({ book, className }, ref) => {
  const authors = getAuthors(book, 2);

  // if the book url is undefined, there is no sense displaying it.
  if (!book.url) return null;
  return (
    <li
      className={className}
      ref={ref}
      sx={{
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        flex: `0 0 ${BOOK_WIDTH}px`,
        height: BOOK_HEIGHT,
        mx: 2
      }}
    >
      <Link
        bookUrl={book.url}
        aria-label={`View ${book.title}`}
        sx={{ "&:hover": { textDecoration: "none" } }}
      >
        <BookCover book={book} showMedium={APP_CONFIG.showMedium} />
        <div sx={{ flex: "1 1 auto" }} />
        <H3 sx={{ m: 0, mt: 1, fontSize: -1 }}>
          {truncateString(book.title, twoLines, false)}
        </H3>
        <Text sx={{ fontSize: -1 }}>
          {truncateString(authors.join(", "), twoLines, false)}
        </Text>
      </Link>
    </li>
  );
});

export default BookCard;
