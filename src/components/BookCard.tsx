/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { getAuthors } from "../utils/book";
import Link from "./Link";
import BookCover from "./BookCover";
import { truncateString } from "../utils/string";
import { Text, H3 } from "./Text";
import BookMediumIndicator from "./MediumIndicator";
import { BookData } from "interfaces";

export const BOOK_WIDTH = 215;
export const BOOK_HEIGHT = 330;

const BookCard = React.forwardRef<
  HTMLLIElement,
  { book: BookData; className?: string }
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
        border: "solid",
        bg: "ui.white",
        borderRadius: "card",
        flex: `0 0 ${BOOK_WIDTH}px`,
        height: BOOK_HEIGHT,
        mx: 2
      }}
    >
      <Link
        bookUrl={book.url}
        aria-label={`View ${book.title}`}
        sx={{ p: 3, "&:hover": { textDecoration: "none" } }}
      >
        <BookCover book={book} sx={{ mx: 40 - 16 }} />
        <div sx={{ flex: "1 1 auto" }} />
        <H3 sx={{ m: 0, mt: 2, fontSize: 0 }}>
          {truncateString(book.title, 39, true)}
        </H3>
        <Text>{authors.join(", ")}</Text>
        <BookMediumIndicator book={book} sx={{ color: "ui.gray.dark" }} />
      </Link>
    </li>
  );
});

export default BookCard;
