/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { Tabbable } from "reakit/Tabbable";
import Book, { BOOK_HEIGHT } from "./BookCard";
import { withErrorBoundary } from "./ErrorBoundary";
import { lighten } from "@theme-ui/color";
import { H2 } from "./Text";
import { NavButton } from "./Button";
import ArrowForward from "icons/ArrowForward";
import Stack from "./Stack";
import { BookData, LaneData } from "interfaces";

type BookRefs = {
  [id: string]: React.RefObject<HTMLLIElement>;
};
type CurrentBook = {
  index: number;
  /**
   * The following dictates whether we snap to a book
   */
  snap: boolean;
};

const getfilteredBooksAndRefs = (books: BookData[], omitIds?: string[]) => {
  const filteredBooks = books.filter(book => {
    if (!omitIds?.includes(book.id)) return book;
  });
  /** keep track of a ref for each book */
  const bookRefs: BookRefs = filteredBooks.reduce<{
    [id: string]: React.RefObject<HTMLLIElement>;
  }>((acc, value) => {
    const ref = React.createRef<HTMLLIElement>();
    acc[value.id] = ref;
    return acc;
  }, {});
  return { filteredBooks, bookRefs };
};
/**
 * - scrolls automatically on button clicks
 * - allows the user to free scroll / swipe also
 */
const Lane: React.FC<{
  lane: LaneData;
  omitIds?: string[];
  titleTag?: React.ComponentType;
}> = ({ omitIds, titleTag: TitleTag = H2, lane: { title, books, url } }) => {
  /**
   * We compute these values within a useMemo hook so that they don't change
   * on every render
   */
  const { filteredBooks, bookRefs } = React.useMemo(
    () => getfilteredBooksAndRefs(books, omitIds),
    [books, omitIds]
  );

  /** we will use state to determine which book should be in view */
  const [currentBook, setCurrentBook] = React.useState<CurrentBook>({
    index: 0,
    snap: true
  });
  const [isBrowserScrolling, setIsBrowserScrolling] = React.useState<boolean>(
    false
  );
  // we need a ref to the UL element so we can scroll it
  const scrollContainer = React.useRef<HTMLUListElement | null>(null);

  // vars for when we are at beginning or end of lane
  const isAtIndexEnd = currentBook.index === filteredBooks.length - 1;
  const isAtScrollEnd = !!(
    scrollContainer.current &&
    scrollContainer.current.scrollLeft ===
      scrollContainer.current.scrollWidth - scrollContainer.current.offsetWidth
  );
  const isAtEnd = !!(isAtIndexEnd || isAtScrollEnd);
  const isAtStart = currentBook.index === 0;

  /** Handlers for button clicks */
  const handleRightClick = () => {
    if (isAtEnd) return;
    setCurrentBook(book => ({
      snap: true,
      index: book.index + 1
    }));
  };
  const handleLeftClick = () => {
    if (isAtStart) return;
    setCurrentBook(book => ({
      snap: true,
      index: book.index - 1
    }));
  };

  // will be used to set a timeout when the browser is auto scrolling
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const browserScrollTime = 1000; // guess how long the browser takes to scroll

  /**
   * This effect is used to snap us to a particular book when the
   * currentBook changes. It bails out if snap is false, which is
   * the case when the user is free-scrolling
   */
  React.useLayoutEffect(() => {
    if (!currentBook.snap) return;
    const currentIndex = currentBook.index;
    // we explicitly state this can be undefined because the array might be empty
    // and typescript doesn't catch this kind of error
    const nextBook: BookData | undefined = filteredBooks[currentIndex];
    // if the nextBook is undefined, don't do anything
    if (!nextBook) return;
    const nextBookRef = bookRefs[nextBook.id];
    const bookX = nextBookRef.current?.offsetLeft || 0;

    scrollContainer.current?.scrollTo({
      left: bookX,
      behavior: "smooth"
    });
    // allows us to bail out of handleScroll when the browser is autoscrolling
    setIsBrowserScrolling(true);
    // clear the old timeout and set a new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsBrowserScrolling(false);
    }, browserScrollTime);

    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
  }, [currentBook, filteredBooks, bookRefs]);

  const getBookWidth = () => {
    const firstBookId = filteredBooks[0].id;
    const firstBookRef = bookRefs[firstBookId];
    const firstBookWidth = firstBookRef.current?.offsetWidth || 0;
    return firstBookWidth;
  };
  /**
   * Handles the user's free-scrolling interaction. Will bail out if
   * the browser is scrolling via the scrollTo method, which does trigger
   * this event. It will keep the current book up to date as we free
   * scroll so that the next arrow button click will take us to the right
   * book.
   */
  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    if (isBrowserScrolling) return;
    const position = e.currentTarget.scrollLeft;
    const bookWidth = getBookWidth();
    const currentIndex = Math.floor(position / bookWidth);
    setCurrentBook({ index: currentIndex, snap: false });
  };

  return (
    <li sx={{ m: 0, p: 0, mb: 3, listStyle: "none" }} aria-label={title}>
      <Stack
        sx={{
          justifyContent: ["space-between", "initial"],
          px: [3, 5],
          alignItems: "baseline"
        }}
      >
        <TitleTag sx={{ pr: [3, 5], m: 0, mb: 3 }}>{title}</TitleTag>
        <NavButton
          variant="link"
          collectionUrl={url}
          iconRight={ArrowForward}
          sx={{ variant: "text.body.bold", textDecoration: "none" }}
        >
          See More
        </NavButton>
      </Stack>
      <div
        sx={{
          display: "flex",
          flexDirection: "row",
          position: "relative"
        }}
      >
        <PrevNextButton isPrev onClick={handleLeftClick} disabled={isAtStart} />

        <ul
          ref={scrollContainer}
          data-testid="lane-list"
          sx={{
            p: 0,
            m: 0,
            display: "flex",
            transition: "transform 300ms ease 100ms",
            overflowX: "scroll",
            overflowY: "hidden",
            position: "relative",
            width: "100%"
          }}
          onScroll={handleScroll}
        >
          {filteredBooks.map(book => (
            <Book key={book.id} book={book} ref={bookRefs[book.id]} />
          ))}
        </ul>

        <PrevNextButton onClick={handleRightClick} disabled={isAtEnd} />
      </div>
    </li>
  );
};

const PrevNextButton: React.FC<{
  onClick: () => void;
  isPrev?: boolean;
  disabled: boolean;
}> = ({ onClick, isPrev = false, disabled }) => {
  return (
    <Tabbable
      as="div"
      sx={{
        flex: "0 0 64px",
        fontSize: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "ui.gray.medium"
        },
        transition: "all 100ms ease-in"
      }}
      onClick={onClick}
      role="button"
      aria-label={isPrev ? "scroll left" : "scroll right"}
      disabled={disabled}
    >
      <ArrowForward
        sx={{
          fill: disabled ? "ui.gray.medium" : "ui.gray.extraDark",
          transform: isPrev ? "rotate(180deg)" : ""
        }}
      />
    </Tabbable>
  );
};

const LaneErrorFallback: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: BOOK_HEIGHT,
        py: 3,
        px: 2,
        backgroundColor: lighten("warn", 0.35),
        m: 2,
        borderRadius: "card"
      }}
    >
      {message}
    </div>
  );
};
export default withErrorBoundary(Lane, LaneErrorFallback);
