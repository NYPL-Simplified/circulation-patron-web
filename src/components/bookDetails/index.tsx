/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { SetCollectionAndBook } from "../../interfaces";
import BookCover from "../BookCover";
import Recommendations from "./Recommendations";
import {
  mapDispatchToProps,
  mapStateToProps,
  mergeRootProps
} from "opds-web-client/lib/components/mergeRootProps";
import { BookData, FetchErrorData } from "opds-web-client/lib/interfaces";
import { connect } from "react-redux";
import ExternalLink from "../ExternalLink";
import useSetCollectionAndBook from "../../hooks/useSetCollectionAndBook";
import { PageLoader } from "../LoadingIndicator";
import FulfillmentCard from "./FulfillmentCard";
import BreadcrumbBar from "../BreadcrumbBar";
import truncateString from "../../utils/truncate";
import useNormalizedBook from "../../hooks/useNormalizedBook";
import { Helmet } from "react-helmet-async";
import DetailField from "../BookMetaDetail";
import ReportProblem from "./ReportProblem";
import useTypedSelector from "../../hooks/useTypedSelector";
import { NavButton } from "../Button";

export interface BookDetailsPropsNew {
  setCollectionAndBook: SetCollectionAndBook;
}

export const sidebarWidth = 200;

export const BookDetails: React.FC<BookDetailsPropsNew> = ({
  setCollectionAndBook
}) => {
  // set the collection and book
  useSetCollectionAndBook(setCollectionAndBook);

  const book = useNormalizedBook();

  const error = useTypedSelector(state => state.book.error);

  if (error) {
    return <Error error={error} />;
  }
  if (!book) return <PageLoader />;
  return (
    <section aria-label="Book details">
      <Helmet>
        <title>{book.title}</title>
      </Helmet>
      <BreadcrumbBar currentLocation={truncateString(book.title, 20, false)} />
      <div
        sx={{
          variant: "cards.bookDetails",
          border: "1px solid",
          borderColor: "primaries.dark",
          borderRadius: "card",
          p: [2, 4]
        }}
      >
        <div id="top" sx={{ display: "flex" }}>
          {/* side bar */}
          <div
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              maxWidth: sidebarWidth
            }}
          >
            <BookCover book={book} sx={{ m: 2 }} />
            {/* download requirements & download links */}
            <div
              sx={{
                display: ["none", "none", "block"]
              }}
            >
              <FulfillmentCard sx={{ m: 2 }} book={book} />
              <DownloadRequirements sx={{ m: 2 }} />
            </div>
          </div>

          {/* title, details, summary */}
          <section aria-label="Book Info" sx={{ flex: 2, m: 2 }}>
            <Styled.h2
              sx={{
                variant: "text.bookTitle",
                my: [3],
                fontSize: [3, 3, 4]
              }}
            >
              {book.title}
              {book.subtitle && `: ${book.subtitle}`}
            </Styled.h2>
            <Styled.h3 sx={{ color: "primary", fontSize: [2, 2, 3] }}>
              By {book.authors?.join(", ") ?? "Unknown"}
            </Styled.h3>
            <DetailField heading="Publisher" details={book.publisher} />
            <DetailField heading="Published" details={book.published} />
            <DetailField
              heading="Categories"
              details={book.categories?.join(", ")}
            />
            <ReportProblem book={book} />
            <Summary sx={{ display: ["none", "none", "block"] }} book={book} />
          </section>
        </div>
        {/* the summary is displayed below when on small screens */}
        <Summary book={book} sx={{ display: ["block", "block", "none"] }} />
        {/* the download requirements are displayed below on small screens */}
        <div
          sx={{
            display: ["flex", "flex", "none"],
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <DownloadRequirements sx={{ m: 2 }} />
          <FulfillmentCard book={book} />
        </div>
      </div>
      <Recommendations book={book} />
    </section>
  );
};

const Summary: React.FC<{ book: BookData; className?: string }> = ({
  book,
  className
}) => (
  <div sx={{ my: 2 }} className={className} aria-label="Book summary">
    <Styled.h3 sx={{ mb: 3, fontSize: 4 }}>Summary</Styled.h3>
    <div
      dangerouslySetInnerHTML={{
        __html: book.summary ?? "Summary not provided."
      }}
      sx={{
        maxHeight: "50vh",
        overflowY: "scroll",
        "&>p": {
          m: 0
        }
      }}
    />
  </div>
);

const DownloadRequirements: React.FC<{ className?: string }> = ({
  className
}) => {
  return (
    <section
      aria-label="Download requirements"
      sx={{
        border: "1px solid",
        borderColor: "primary",
        backgroundColor: "lightGrey",
        borderRadius: "card",
        display: "flex",
        flexDirection: "column",
        // alignItems: "center",
        py: 2,
        px: 3,
        maxWidth: sidebarWidth
      }}
      className={className}
    >
      <Styled.h3 id="requirements-header" sx={{ fontSize: 2, m: 0, mb: 2 }}>
        Download Requirements:
      </Styled.h3>
      <ol
        sx={{ m: 0, p: 0, pl: 3, fontSize: 1 }}
        aria-labelledby="requirements-header"
      >
        <li>
          <ExternalLink href="https://accounts.adobe.com/">
            Create Adobe ID
          </ExternalLink>
        </li>
        <li>
          Install an eBook Reader:
          <br />
          <ExternalLink href="https://www.adobe.com/solutions/ebook/digital-editions/download.html">
            Adobe Digital Editions
          </ExternalLink>
          <br />
          <ExternalLink href="http://www.bluefirereader.com/bluefire-reader.html">
            Bluefire Reader
          </ExternalLink>
          <br />
          <span>* Or another Adobe-compatible application</span>
        </li>
      </ol>
    </section>
  );
};

const Error: React.FC<{ error: FetchErrorData }> = ({ error }) => (
  <section
    aria-label="Book details"
    sx={{
      display: "flex",
      flexDirection: "column",
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <Helmet>
      <title>Book error</title>
    </Helmet>
    <div>
      <p>
        There was a problem fetching this book. Please refresh the page or
        return home.
      </p>
      <div>
        <span sx={{ fontWeight: "bold" }}>Error Code: </span>
        {error.status ?? "unknown"}
      </div>
      <div>
        <span sx={{ fontWeight: "bold" }}>Error Message: </span>
        {error.response}
      </div>
      <NavButton sx={{ mt: 3 }} to="/">
        Return Home
      </NavButton>
    </div>
  </section>
);

const Connected = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(BookDetails);

// am doing this because typescript throws an error when trying to use
// redux ConnectedComponent inside of Route
const Wrapper = props => <Connected {...props} />;
export default Wrapper;
