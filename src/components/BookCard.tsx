/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { BookData } from "opds-web-client/lib/interfaces";
import { getAuthors } from "../utils/book";
import Link from "./Link";
import BookCover from "./BookCover";
import truncateString from "../utils/truncate";
import Button from "./Button";
import useBorrow from "../hooks/useBorrow";

export const BOOK_HEIGHT = 200;

const BookCard = React.forwardRef<
  HTMLLIElement,
  { book: BookData; className?: string; showBorrowButton?: boolean }
>(({ book, className, showBorrowButton = false }, ref) => {
  const {
    borrowOrReserve,
    label,
    isBorrowed,
    isReserved,
    isBorrowable
  } = useBorrow(book);
  const authors = getAuthors(book, 2);

  // if the book url is undefined, there is no sense displaying it.
  if (!book.url) return null;
  return (
    <li
      className={className}
      ref={ref}
      sx={{
        listStyle: "none",
        display: "block",
        border: "1px solid",
        borderColor: "primaries.dark",
        borderRadius: "card",
        py: 3,
        px: 2,
        flex: `0 0 ${BOOK_HEIGHT}px`,
        mx: 2,
        textAlign: "center"
      }}
    >
      <Link bookUrl={book.url}>
        <BookCover book={book} sx={{ mx: 4 }} />
        <Styled.h2
          sx={{
            variant: "text.bookTitle",
            fontSize: 2
          }}
        >
          {truncateString(book.title, 50, true)}
        </Styled.h2>
        <span sx={{ color: "primary" }}>{authors.join(", ")}</span>
        {showBorrowButton && (
          <Button
            disabled={isBorrowed || isReserved || !isBorrowable}
            onClick={borrowOrReserve}
            sx={{ mt: 3 }}
          >
            {label}
          </Button>
        )}
      </Link>
    </li>
  );
});

export default BookCard;
