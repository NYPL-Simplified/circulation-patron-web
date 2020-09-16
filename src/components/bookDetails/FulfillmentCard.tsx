/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import {
  getFulfillmentState,
  dedupeLinks,
  availabilityString,
  queueString,
  bookIsAudiobook
} from "utils/book";
import Button, { NavButton } from "../Button";
import useDownloadButton from "owc/hooks/useDownloadButton";
import { withErrorBoundary } from "../ErrorBoundary";
import Stack from "components/Stack";
import { Text } from "components/Text";
import { MediumIcon } from "components/MediumIndicator";
import SvgExternalLink from "icons/ExternalOpen";
import SvgDownload from "icons/Download";
import SvgPhone from "icons/Phone";
import useIsBorrowed from "hooks/useIsBorrowed";
import {
  NEXT_PUBLIC_COMPANION_APP,
  NEXT_PUBLIC_AXIS_NOW_DECRYPT
} from "../../utils/env";
import BorrowOrReserve from "components/BorrowOrReserve";
import { BookData, MediaLink } from "interfaces";

const FulfillmentCard: React.FC<{ book: BookData }> = ({ book }) => {
  return (
    <Stack
      direction="column"
      aria-label="Borrow and download card"
      sx={{
        bg: "ui.gray.lightWarm",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "ui.gray.extraDark",
        my: 3
      }}
    >
      <FulfillmentContent book={book} />
    </Stack>
  );
};

const FulfillmentContent: React.FC<{
  book: BookData;
}> = ({ book }) => {
  const isBorrowed = useIsBorrowed(book);
  const fulfillmentState = getFulfillmentState(book, isBorrowed);

  switch (fulfillmentState) {
    case "AVAILABLE_OPEN_ACCESS":
      if (!book.openAccessLinks)
        throw new Error("This open-access book is missing open access links");
      return (
        <AccessCard
          links={book.openAccessLinks}
          book={book}
          subtitle="This open-access book is available to keep forever."
        />
      );

    case "AVAILABLE_TO_BORROW": {
      return (
        <CTAPanel
          title="This book is available to borrow!"
          subtitle={
            <>
              <MediumIcon book={book} sx={{ mr: 1 }} />{" "}
              {availabilityString(book)}
            </>
          }
          book={book}
          isBorrow={true}
        />
      );
    }

    case "AVAILABLE_TO_RESERVE": {
      return (
        <CTAPanel
          title="This book is currently unavailable."
          subtitle={
            <>
              <MediumIcon book={book} sx={{ mr: 1 }} />{" "}
              {availabilityString(book)}
              {typeof book.holds?.total === "number" &&
                ` ${book.holds.total} patrons in the queue.`}
            </>
          }
          book={book}
          isBorrow={false}
        />
      );
    }

    case "RESERVED":
      return <Reserved book={book} />;

    case "READY_TO_BORROW": {
      const availableUntil = book.availability?.until
        ? new Date(book.availability.until).toDateString()
        : "NaN";

      const title = "You can now borrow this book!";
      const subtitle =
        availableUntil !== "NaN"
          ? `Your hold will expire on ${availableUntil}. ${queueString(book)}`
          : "You must borrow this book before your loan expires.";

      return (
        <CTAPanel
          title={title}
          subtitle={subtitle}
          book={book}
          isBorrow={true}
        />
      );
    }

    case "AVAILABLE_TO_ACCESS": {
      if (!book.fulfillmentLinks)
        throw new Error(
          "This available-to-access book is missing fulfillment links."
        );

      const availableUntil = book.availability?.until
        ? new Date(book.availability.until).toDateString()
        : "NaN";

      const subtitle =
        availableUntil !== "NaN"
          ? `You have this book on loan until ${availableUntil}.`
          : "You have this book on loan.";
      return (
        <AccessCard
          links={book.fulfillmentLinks}
          book={book}
          subtitle={subtitle}
        />
      );
    }

    case "FULFILLMENT_STATE_ERROR":
      return <ErrorCard />;
  }
};

const CTAPanel: React.FC<{
  title: string;
  subtitle: React.ReactNode;
  isBorrow: boolean;
  book: BookData;
}> = ({ title, subtitle, isBorrow, book }) => {
  return (
    <>
      <Text variant="text.callouts.bold">{title}</Text>
      <Text
        variant="text.body.italic"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          textAlign: "center"
        }}
      >
        {subtitle}
      </Text>
      {book.allBorrowLinks?.map(link => {
        return (
          <BorrowOrReserve
            book={book}
            key={link.url}
            borrowLink={link}
            isBorrow={isBorrow}
          />
        );
      })}
    </>
  );
};

const Reserved: React.FC<{ book: BookData }> = ({ book }) => {
  const position = book.holds?.position;
  return (
    <>
      <Text variant="text.callouts.bold">You have this book on hold.</Text>
      {!!position && (
        <Text
          variant="text.body.italic"
          sx={{ display: "inline-flex", alignItems: "center" }}
        >
          <MediumIcon book={book} sx={{ mr: 1 }} />
          Your hold position is: {position}.
        </Text>
      )}
      <Button size="lg" disabled aria-label="Reserved" role="button">
        <Text variant="text.body.bold">Reserved</Text>
      </Button>
      {/* {errorMsg && <Text sx={{ color: "ui.error" }}>Error: {errorMsg}</Text>} */}
    </>
  );
};

const ErrorCard: React.FC = () => {
  return (
    <>
      <Text variant="text.callouts.bold">
        There was an error processing this book.
      </Text>
      <Text
        variant="text.body.italic"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          textAlign: "center"
        }}
      >
        We are unable to show you the book&apos;s availability. Try refreshing
        your page. If the problem persists, please contact library support.
      </Text>
    </>
  );
};

/**
 * Handles the case where it is ready for access either via openAccessLink or
 * via fulfillmentLink.
 */
const AccessCard: React.FC<{
  book: BookData;
  links: MediaLink[];
  subtitle: string;
}> = ({ book, links, subtitle }) => {
  const { title } = book;
  const dedupedLinks = dedupeLinks(links);
  const isAudiobook = bookIsAudiobook(book);
  const companionApp =
    NEXT_PUBLIC_COMPANION_APP === "openebooks" ? "Open eBooks" : "SimplyE";

  return (
    <>
      <Stack sx={{ alignItems: "center" }}>
        <SvgPhone sx={{ fontSize: 64 }} />
        <Stack direction="column">
          <Text variant="text.callouts.bold">
            You&apos;re ready to read this book in {companionApp}!
          </Text>
          <Text>{subtitle}</Text>
        </Stack>
      </Stack>
      {!isAudiobook && (
        <Stack direction="column" sx={{ mt: 3 }}>
          <Text variant="text.body.italic" sx={{ textAlign: "center" }}>
            If you would rather read on your computer, you can:
          </Text>
          <Stack sx={{ justifyContent: "center", flexWrap: "wrap" }}>
            {dedupedLinks.map(link => {
              //Only AxisNow files can be read online, and all of those are encrypted.
              if (
                NEXT_PUBLIC_COMPANION_APP === "openebooks" &&
                NEXT_PUBLIC_AXIS_NOW_DECRYPT &&
                link.type === "application/vnd.librarysimplified.axisnow+json"
              ) {
                return <ReadOnlineButton key={link.url} link={link} />;
              }
              return (
                <DownloadButton key={link.url} link={link} title={title} />
              );
            })}
          </Stack>
        </Stack>
      )}
    </>
  );
};

const ReadOnlineButton: React.FC<{
  link: MediaLink;
}> = ({ link }) => {
  const readerLink = `/read/${encodeURIComponent(link.url)}`;
  return (
    <NavButton
      variant="ghost"
      color="ui.gray.extraDark"
      iconLeft={SvgExternalLink}
      href={readerLink}
    >
      Read Online
    </NavButton>
  );
};

const DownloadButton: React.FC<{
  link: MediaLink;
  title: string;
}> = ({ link, title }) => {
  const downloadDetails = useDownloadButton(link, title);
  if (!downloadDetails) return null;
  const { fulfill, downloadLabel } = downloadDetails;
  return (
    <Button
      onClick={fulfill}
      variant="ghost"
      color="ui.gray.extraDark"
      iconLeft={SvgDownload}
    >
      {downloadLabel}
    </Button>
  );
};

export default withErrorBoundary(FulfillmentCard, ErrorCard);
