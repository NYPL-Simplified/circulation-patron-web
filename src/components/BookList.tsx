/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { truncateString, stripHTML } from "../utils/string";
import {
  getAuthors,
  getFulfillmentState,
  availabilityString
} from "../utils/book";
import Lane from "./Lane";
import Button, { NavButton } from "./Button";
import LoadingIndicator from "./LoadingIndicator";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { H2, Text } from "./Text";
import * as DS from "@nypl/design-system-react-components";
import MediumIndicator from "components/MediumIndicator";
import { ArrowForward } from "icons";
import useIsBorrowed from "hooks/useIsBorrowed";
import BookCover from "./BookCover";
import Stack from "./Stack";
import BorrowOrReserve from "./BorrowOrReserve";
import { BookData, LaneData, RequiredKeys } from "interfaces";

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

type BookWithUrl = RequiredKeys<BookData, "url">;
const hasUrl = (book: BookData): book is BookWithUrl => !!book.url;

export const ListView: React.FC<{
  books: BookData[];
}> = ({ books }) => {
  // this hook will refetch the page when we reach the bottom of the screen
  const { listRef, isFetchingPage } = useInfiniteScroll();

  return (
    <React.Fragment>
      <ul ref={listRef} sx={{ px: 5 }} data-testid="listview-list">
        {books.map(book => (
          <BookListItem key={book.id} book={book} />
        ))}
      </ul>
      {isFetchingPage && <ListLoadingIndicator />}
    </React.Fragment>
  );
};

export const BookListItem: React.FC<{
  book: BookData;
}> = ({ book }) => {
  // if there is no book url, it doesn't make sense to display it.
  if (!hasUrl(book)) return null;

  return (
    <li
      sx={{
        listStyle: "none"
      }}
      aria-label={`Book: ${book.title}`}
    >
      <DS.Card
        sx={{ ".card__ctas": { margin: "auto" }, bg: "ui.white" }}
        image={
          <BookCover
            book={book}
            sx={{
              height: "100%",
              width: "100%",
              maxHeight: "100%",
              maxWidth: "100%"
            }}
          />
        }
        ctas={
          <div
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
              textAlign: "center"
            }}
          >
            <BookListCTA book={book} />
          </div>
        }
      >
        <H2 sx={{ mb: 0 }}>{truncateString(book.title, 50)}</H2>
        {book.subtitle && (
          <Text variant="callouts.italic">
            {truncateString(book.subtitle, 50)}
          </Text>
        )}
        by&nbsp;
        <Text>
          {getAuthors(book, 2).join(", ")}
          {book.authors?.length &&
            book.authors.length > 2 &&
            ` & ${book.authors?.length - 2} more`}
        </Text>
        <MediumIndicator book={book} sx={{ color: "ui.gray.dark" }} />
        <div sx={{ mt: 3 }}>
          <Text
            variant="text.body.italic"
            dangerouslySetInnerHTML={{
              __html: truncateString(stripHTML(book.summary ?? ""), 200)
            }}
          ></Text>
        </div>
      </DS.Card>
    </li>
  );
};

const BookListCTA: React.FC<{ book: BookWithUrl }> = ({ book }) => {
  const isBorrowed = useIsBorrowed(book);
  const fulfillmentState = getFulfillmentState(book, isBorrowed);
  const getCtaButtons = (isBorrow: boolean) => {
    return (
      <Stack
        direction={"column"}
        sx={{
          mt: 2
        }}
      >
        {book.allBorrowLinks?.map(link => {
          return (
            <BorrowOrReserve
              key={link.url}
              book={book}
              borrowLink={link}
              isBorrow={isBorrow}
            />
          );
        })}
      </Stack>
    );
  };

  switch (fulfillmentState) {
    case "AVAILABLE_OPEN_ACCESS":
      return (
        <>
          <Text
            variant="text.body.italic"
            sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
          >
            This open-access book is available to keep forever.
          </Text>
          <NavButton
            variant="ghost"
            bookUrl={book.url}
            iconRight={ArrowForward}
          >
            View Book Details
          </NavButton>
        </>
      );

    case "AVAILABLE_TO_BORROW":
      return (
        <>
          {getCtaButtons(true)}

          <Text
            variant="text.body.italic"
            sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
          >
            {availabilityString(book)}
          </Text>

          <NavButton
            variant="ghost"
            bookUrl={book.url}
            iconRight={ArrowForward}
          >
            View Book Details
          </NavButton>
        </>
      );

    case "AVAILABLE_TO_RESERVE":
      return (
        <>
          {getCtaButtons(false)}

          <Text
            variant="text.body.italic"
            sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
          >
            {availabilityString(book)}
          </Text>
          <NavButton
            variant="ghost"
            bookUrl={book.url}
            iconRight={ArrowForward}
          >
            View Book Details
          </NavButton>
        </>
      );

    case "RESERVED": {
      const position = book.holds?.position;
      return (
        <>
          <Button disabled color="ui.black">
            Reserved
          </Button>
          <Text
            variant="text.body.italic"
            sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
          >
            You have this book on hold.{" "}
            {typeof position === "number" &&
              !isNaN(position) &&
              `Position: ${position}`}
          </Text>
          <NavButton
            variant="ghost"
            bookUrl={book.url}
            iconRight={ArrowForward}
          >
            View Book Details
          </NavButton>
        </>
      );
    }

    case "READY_TO_BORROW": {
      return (
        <>
          {getCtaButtons(true)}
          <Text
            variant="text.body.italic"
            sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
          >
            You can now borrow this book!
          </Text>
          <NavButton
            variant="ghost"
            bookUrl={book.url}
            iconRight={ArrowForward}
          >
            View Book Details
          </NavButton>
        </>
      );
    }

    case "AVAILABLE_TO_ACCESS": {
      const availableUntil = book.availability?.until
        ? new Date(book.availability.until).toDateString()
        : "NaN";

      const subtitle =
        availableUntil !== "NaN"
          ? `You have this book on loan until ${availableUntil}.`
          : "You have this book on loan.";

      return (
        <>
          <Text
            variant="text.body.italic"
            sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
          >
            {subtitle}
          </Text>
          <NavButton
            variant="ghost"
            bookUrl={book.url}
            iconRight={ArrowForward}
          >
            View Book Details
          </NavButton>
        </>
      );
    }

    case "FULFILLMENT_STATE_ERROR":
      return (
        <NavButton variant="ghost" bookUrl={book.url} iconRight={ArrowForward}>
          View Book Details
        </NavButton>
      );

    default:
      return null;
  }
};

export const LanesView: React.FC<{ lanes: LaneData[] }> = ({ lanes }) => {
  return (
    <ul sx={{ m: 0, p: 0 }}>
      {lanes.map(lane => (
        <Lane key={lane.url} lane={lane} />
      ))}
    </ul>
  );
};
