/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { AnyBook } from "interfaces";
import BookCover from "../BookCover";
import Recommendations from "./Recommendations";
import { PageLoader } from "../LoadingIndicator";
import FulfillmentCard from "./FulfillmentCard";
import BreadcrumbBar from "../BreadcrumbBar";
import { truncateString } from "../../utils/string";
import DetailField from "../BookMetaDetail";
import ReportProblem from "./ReportProblem";
import { NavButton } from "../Button";
import Head from "next/head";
import { H1, H2, H3, Text } from "components/Text";
import MediumIndicator from "components/MediumIndicator";
import SimplyELogo from "components/SimplyELogo";
import IosBadge from "components/storeBadges/IosBadge";
import GooglePlayBadge from "components/storeBadges/GooglePlayBadge";
import { useRouter } from "next/router";
import extractParam from "dataflow/utils";
import useSWR from "swr";
import { fetchBook } from "dataflow/opds1/fetch";
import useUser from "components/context/UserContext";
import { ServerError } from "errors";
import { ProblemDocument } from "types/opds1";
import { APP_CONFIG } from "config";

export const BookDetails: React.FC = () => {
  const { query } = useRouter();
  const bookUrl = extractParam(query, "bookUrl");
  const { data, error } = useSWR(bookUrl ?? null, fetchBook);
  const { loans } = useUser();
  // use the loans version if it exists
  const book = loans?.find(loanedBook => data?.id === loanedBook.id) ?? data;

  if (error) {
    if (error instanceof ServerError) {
      return <Error info={error.info} />;
    }
    return <Error />;
  }

  if (!book) return <PageLoader />;

  return (
    <section aria-label="Book details">
      <Head>
        <title>{book.title}</title>
      </Head>
      <BreadcrumbBar currentLocation={truncateString(book.title, 60, false)} />
      <div sx={{ maxWidth: 1100, mx: "auto" }}>
        <div
          sx={{
            display: "flex",
            mx: [3, 5],
            my: 4,
            flexWrap: ["wrap", "nowrap"]
          }}
        >
          <div sx={{ flex: ["1 1 auto", 0.33], mr: [0, 4], mb: [3, 0] }}>
            <BookCover book={book} sx={{ maxWidth: [180, "initial"] }} />

            {APP_CONFIG.companionApp === "simplye" && (
              <SimplyECallout sx={{ display: ["none", "block"] }} />
            )}
          </div>
          <div
            sx={{
              flex: ["1 1 auto", 0.66],
              display: "flex",
              flexDirection: "column"
            }}
            aria-label="Book info"
          >
            <H1 sx={{ m: 0 }}>
              {book.title}
              {book.subtitle && `: ${book.subtitle}`}
            </H1>

            <Text variant="text.callouts.regular">
              by&nbsp;
              {book.authors?.join(", ") ?? "Unknown"}
            </Text>
            <MediumIndicator book={book} />
            <FulfillmentCard book={book} sx={{ mt: 3 }} />
            <Summary book={book} />
            <div sx={{ mt: 2 }}>
              <DetailField heading="Publisher" details={book.publisher} />
              <DetailField heading="Published" details={book.published} />
              <DetailField
                heading="Categories"
                details={book.categories?.join(", ")}
              />
            </div>
            <ReportProblem book={book} />
          </div>
        </div>
      </div>
      <Recommendations book={book} />
    </section>
  );
};

const Summary: React.FC<{ book: AnyBook; className?: string }> = ({
  book,
  className
}) => (
  <div sx={{ my: 2 }} className={className} aria-label="Book summary">
    <H2 sx={{ mb: 2, variant: "text.headers.tertiary" }}>Summary</H2>
    <div
      dangerouslySetInnerHTML={{
        __html: book.summary ?? "Summary not provided."
      }}
    />
  </div>
);

const SimplyECallout: React.FC<{ className?: "string" }> = ({ className }) => {
  return (
    <section
      aria-label="Download the SimplyE Mobile App"
      sx={{
        mt: 4,
        bg: "ui.gray.lightWarm",
        display: "flex",
        flexDirection: "column",
        p: 3,
        textAlign: "center"
      }}
      className={className}
    >
      <SimplyELogo sx={{ m: 3 }} />
      <H3 sx={{ mt: 0 }}>Read Now. Read Everywhere.</H3>
      <Text>
        Browse and read our collection of eBooks and Audiobooks right from your
        phone.
      </Text>
      <div sx={{ maxWidth: 140, mx: "auto", mt: 3 }}>
        <IosBadge sx={{ m: "6%" }} />
        <GooglePlayBadge />
      </div>
    </section>
  );
};

const Error: React.FC<{ info?: ProblemDocument }> = ({ info }) => {
  return (
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
      <Head>
        <title>Book error</title>
      </Head>
      <div sx={{ maxWidth: "70%" }}>
        <p>
          There was a problem fetching this book. Please refresh the page or
          return home.
        </p>
        <div>
          <span sx={{ fontWeight: "bold" }}>Error Code: </span>
          {info?.status ?? "unknown"}
        </div>
        <div>
          <span sx={{ fontWeight: "bold" }}>Error Message: </span>
          {info?.detail ?? "An Unknown fetch error occurred."}
        </div>
        <NavButton sx={{ mt: 3 }} href="/">
          Return Home
        </NavButton>
      </div>
    </section>
  );
};

export default BookDetails;
