/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { BookData, LaneData } from "opds-web-client/lib/interfaces";
import BreadcrumbBar from "./BreadcrumbBar";
import useCatalogLink from "../hooks/useCatalogLink";
import BookCover from "./BookCover";
import truncateString from "../utils/truncate";
import { getAuthors } from "../utils/book";
import Lane from "./Lane";
import Link from "./Link";
import DetailField from "./BookMetaDetail";
import useBorrow from "../hooks/useBorrow";
import Button from "./Button";
import { useBreakpointIndex } from "@theme-ui/match-media";
import BookCard from "./BookCard";
import LoadingIndicator from "./LoadingIndicator";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

/**
 * In a collection you can:
 *  - See lanes view
 *  - See List/Gallery view
 *    - Switch between list and gallery in this case
 */

const ListLoadingIndicator = () => (
  <div
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: 2,
      fontWeight: "heading",
      p: 3
    }}
  >
    <LoadingIndicator /> Loading more books...
  </div>
);

export const GalleryView: React.FC<{
  books: BookData[];
  breadcrumb?: React.ReactNode;
  showBorrowButton?: boolean;
}> = ({ books, breadcrumb, showBorrowButton = false }) => {
  // this hook will refetch the page when we reach the bottom of the screen
  const { listRef, isFetchingPage } = useInfiniteScroll();

  return (
    <div>
      <BreadcrumbBar>{breadcrumb}</BreadcrumbBar>
      <ul
        ref={listRef}
        data-testid="gallery-list"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          justifyContent: "center",
          p: 0,
          m: 0
        }}
      >
        {books.map(book => (
          <BookCard
            book={book}
            key={book.id}
            sx={{ listStyle: "none", flex: "0 0 170px", my: 3, mx: 3 }}
            showBorrowButton={showBorrowButton}
          />
        ))}
      </ul>
      {isFetchingPage && <ListLoadingIndicator />}
    </div>
  );
};

export const ListView: React.FC<{
  books: BookData[];
  breadcrumb?: React.ReactNode;
  showBorrowButton?: boolean;
}> = ({ books, breadcrumb, showBorrowButton = false }) => {
  // this hook will refetch the page when we reach the bottom of the screen
  const { listRef, isFetchingPage } = useInfiniteScroll();
  const breakpoint = useBreakpointIndex();
  // if we are on mobile, show the gallery instead
  if (breakpoint < 1) {
    return (
      <GalleryView
        books={books}
        breadcrumb={breadcrumb}
        showBorrowButton={showBorrowButton}
      />
    );
  }
  return (
    <React.Fragment>
      <BreadcrumbBar>{breadcrumb}</BreadcrumbBar>
      <ul ref={listRef} sx={{ p: 0, m: 0 }} data-testid="listview-list">
        {books.map(book => (
          <BookListItem key={book.id} book={book} />
        ))}
      </ul>
      {isFetchingPage && <ListLoadingIndicator />}
    </React.Fragment>
  );
};

const BookListItem: React.FC<{ book: BookData }> = ({ book }) => {
  const {
    borrowOrReserve,
    label,
    isBorrowed,
    isReserved,
    isBorrowable
  } = useBorrow(book);
  const url = useCatalogLink(book.url);
  return (
    <li
      sx={{
        listStyle: "none",
        border: "1px solid",
        borderColor: "primaries.dark",
        borderRadius: "card",
        height: 140,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: ["wrap", "nowrap"],
        p: 3,
        m: 3
      }}
      aria-label={`Book: ${book.title}`}
    >
      <div sx={{ mx: 1, flex: "0 1 40%", display: "flex" }}>
        <Link to={url}>
          <BookCover book={book} sx={{ width: 70, height: 105 }} />
        </Link>
        <div sx={{ ml: 3 }}>
          <Link to={url}>
            <Styled.h2 sx={{ my: 2, variant: "text.bookTitle" }}>
              {truncateString(book.title, 50, true)}
            </Styled.h2>
          </Link>
          <span sx={{ color: "primary", fontSize: 2 }}>
            {getAuthors(book, 2).join(", ")}
          </span>
        </div>
      </div>
      <div
        sx={{
          mx: 3,
          flex: "0 1 40%",
          display: "flex"
        }}
        aria-label="Book metadata"
      >
        <div>
          <DetailField heading="Publisher" details={book.publisher} />
          <DetailField heading="Published" details={book.published} />
          <DetailField
            heading="Categories"
            details={book.categories?.join(", ")}
          />
        </div>
      </div>
      <div
        sx={{
          mx: 3,
          flex: "0 1 20%",
          display: "flex",
          justifyContent: "flex-end"
        }}
      >
        <Button
          disabled={isBorrowed || isReserved || !isBorrowable}
          onClick={borrowOrReserve}
        >
          {label}
        </Button>
      </div>
    </li>
  );
};

export const LanesView: React.FC<{ lanes: LaneData[] }> = ({ lanes }) => {
  return (
    <React.Fragment>
      {lanes.map(lane => (
        <Lane key={lane.url} lane={lane} />
      ))}
    </React.Fragment>
  );
};
