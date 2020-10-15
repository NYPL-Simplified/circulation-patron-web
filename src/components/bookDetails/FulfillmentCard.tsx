/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import {
  availabilityString,
  queueString,
  bookIsAudiobook,
  bookIsBorrowable,
  bookIsReservable,
  bookIsReserved,
  bookIsOnHold,
  bookIsFulfillable
} from "utils/book";
import Button from "../Button";
import withErrorBoundary from "../ErrorBoundary";
import Stack from "components/Stack";
import { Text } from "components/Text";
import { MediumIcon } from "components/MediumIndicator";
import SvgExternalLink from "icons/ExternalOpen";
import SvgDownload from "icons/Download";
import SvgPhone from "icons/Phone";
import BorrowOrReserve from "components/BorrowOrReserve";
import {
  AnyBook,
  FulfillableBook,
  FulfillmentLink,
  ReservedBook
} from "interfaces";
import {
  dedupeLinks,
  DownloadDetails,
  getFulfillmentDetails,
  ReadExternalDetails,
  ReadInternalDetails,
  shouldRedirectToCompanionApp
} from "utils/fulfill";
import useDownloadButton from "hooks/useDownloadButton";
import useReadOnlineButton from "hooks/useReadOnlineButton";
import { APP_CONFIG } from "config";
import track from "analytics/track";
import { useRouter } from "next/router";
import useLinkUtils from "hooks/useLinkUtils";

const FulfillmentCard: React.FC<{ book: AnyBook }> = ({ book }) => {
  return (
    <div
      aria-label="Borrow and download card"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        color: "ui.gray.extraDark"
      }}
    >
      <FulfillmentContent book={book} />
    </div>
  );
};

const FulfillmentContent: React.FC<{
  book: AnyBook;
}> = ({ book }) => {
  if (bookIsBorrowable(book)) {
    return (
      <BorrowOrReserveBlock
        title="Available to borrow"
        subtitle={
          <>
            <MediumIcon book={book} sx={{ mr: 1 }} /> {availabilityString(book)}
          </>
        }
        url={book.borrowUrl}
        isBorrow={true}
      />
    );
  }

  if (bookIsReservable(book)) {
    return (
      <BorrowOrReserveBlock
        title="Unavailable"
        subtitle={
          <>
            <MediumIcon book={book} sx={{ mr: 1 }} /> {availabilityString(book)}
            {typeof book.holds?.total === "number" &&
              ` ${book.holds.total} patrons in the queue.`}
          </>
        }
        url={book.reserveUrl}
        isBorrow={false}
      />
    );
  }

  if (bookIsReserved(book)) {
    return <Reserved book={book} />;
  }

  if (bookIsOnHold(book)) {
    const availableUntil = book.availability?.until
      ? new Date(book.availability.until).toDateString()
      : "NaN";

    const title = "On Hold";
    const subtitle =
      availableUntil !== "NaN"
        ? `Your hold will expire on ${availableUntil}. ${queueString(book)}`
        : "You must borrow this book before your loan expires.";

    return (
      <BorrowOrReserveBlock
        title={title}
        subtitle={subtitle}
        url={book.borrowUrl}
        isBorrow={true}
      />
    );
  }

  if (bookIsFulfillable(book)) {
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

  return <Unsupported />;
};

const BorrowOrReserveBlock: React.FC<{
  title: string;
  subtitle: React.ReactNode;
  isBorrow: boolean;
  url: string;
}> = ({ title, subtitle, isBorrow, url }) => {
  return (
    <Stack direction="column" spacing={0} sx={{ my: 3 }}>
      <Text variant="text.body.bold">{title}</Text>
      <Text>{subtitle}</Text>
      <BorrowOrReserve url={url} isBorrow={isBorrow} />
    </Stack>
  );
};

const Reserved: React.FC<{ book: ReservedBook }> = ({ book }) => {
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
    </>
  );
};

const Unsupported: React.FC = () => {
  return (
    <Stack direction="column" spacing={0} sx={{ my: 3 }}>
      <Text variant="text.body.bold">Unsupported</Text>
      <Text>
        This title is not supported in this application, please try another.
      </Text>
    </Stack>
  );
};

/**
 * Handles the case where it is ready for access either via openAccessLink or
 * via fulfillmentLink.
 */
const AccessCard: React.FC<{
  book: FulfillableBook;
  links: FulfillmentLink[];
  subtitle: string;
}> = ({ book, links, subtitle }) => {
  const { title } = book;
  const dedupedLinks = dedupeLinks(links);
  const fulfillments = dedupedLinks
    .map(getFulfillmentDetails)
    .filter(details => details.type !== "unsupported");

  const isFulfillable = fulfillments.length > 0;

  const isAudiobook = bookIsAudiobook(book);
  const redirectUser = shouldRedirectToCompanionApp(links);

  return (
    <Stack direction="column" sx={{ my: 3 }}>
      <AccessHeading
        redirectToCompanionApp={redirectUser}
        subtitle={subtitle}
      />
      {!isAudiobook && isFulfillable && (
        <>
          {redirectUser && (
            <Text variant="text.body.italic">
              If you would rather read on your computer, you can:
            </Text>
          )}
          <Stack sx={{ flexWrap: "wrap" }}>
            {fulfillments.map(details => {
              switch (details.type) {
                case "download":
                  return (
                    <DownloadButton
                      details={details}
                      title={title}
                      key={details.id}
                      isPrimaryAction={!redirectUser}
                    />
                  );
                case "read-online-internal":
                  return (
                    <ReadOnlineInternal
                      details={details}
                      key={details.url}
                      isPrimaryAction={!redirectUser}
                      trackOpenBookUrl={book.trackOpenBookUrl}
                    />
                  );
                case "read-online-external":
                  return (
                    <ReadOnlineExternal
                      details={details}
                      key={details.id}
                      isPrimaryAction={!redirectUser}
                      trackOpenBookUrl={book.trackOpenBookUrl}
                    />
                  );
              }
            })}
          </Stack>
        </>
      )}
    </Stack>
  );
};

const AccessHeading: React.FC<{
  subtitle: string;
  redirectToCompanionApp: boolean;
}> = ({ subtitle, redirectToCompanionApp }) => {
  const companionApp =
    APP_CONFIG.companionApp === "openebooks" ? "Open eBooks" : "SimplyE";

  if (redirectToCompanionApp) {
    return (
      <Stack direction="column">
        <Stack>
          <SvgPhone sx={{ fontSize: 24 }} />
          <Text variant="text.body.bold">
            You&apos;re ready to read this book in {companionApp}!
          </Text>
        </Stack>
        <Text>{subtitle}</Text>
      </Stack>
    );
  }
  return (
    <Stack spacing={0} direction="column">
      <Text variant="text.body.bold">Ready to read!</Text>
      <Text>{subtitle}</Text>
    </Stack>
  );
};

function getButtonStyles(isPrimaryAction: boolean) {
  return isPrimaryAction
    ? ({
        variant: "filled",
        color: "brand.primary"
      } as const)
    : ({
        variant: "ghost",
        color: "ui.gray.extraDark"
      } as const);
}

const ReadOnlineExternal: React.FC<{
  details: ReadExternalDetails;
  isPrimaryAction: boolean;
  trackOpenBookUrl: string | null;
}> = ({ details, isPrimaryAction, trackOpenBookUrl }) => {
  const { open, loading, error } = useReadOnlineButton(
    details,
    trackOpenBookUrl
  );

  return (
    <>
      <Button
        {...getButtonStyles(isPrimaryAction)}
        iconLeft={SvgExternalLink}
        onClick={open}
        loading={loading}
        loadingText="Opening..."
      >
        {details.buttonLabel}
      </Button>
      {error && <Text sx={{ color: "ui.error" }}>{error}</Text>}
    </>
  );
};

const ReadOnlineInternal: React.FC<{
  details: ReadInternalDetails;
  trackOpenBookUrl: string | null;
  isPrimaryAction: boolean;
}> = ({ details, isPrimaryAction, trackOpenBookUrl }) => {
  const router = useRouter();
  const { buildMultiLibraryLink } = useLinkUtils();

  const internalLink = buildMultiLibraryLink(details.url);
  function open() {
    track.openBook(trackOpenBookUrl);
    router.push(internalLink);
  }
  return (
    <Button {...getButtonStyles(isPrimaryAction)} onClick={open}>
      Read
    </Button>
  );
};

const DownloadButton: React.FC<{
  details: DownloadDetails;
  title: string;
  isPrimaryAction: boolean;
}> = ({ details, title, isPrimaryAction }) => {
  const { buttonLabel } = details;
  const { download, error, loading } = useDownloadButton(details, title);
  return (
    <>
      <Button
        onClick={download}
        {...getButtonStyles(isPrimaryAction)}
        iconLeft={SvgDownload}
        loading={loading}
        loadingText="Downloading..."
      >
        {buttonLabel}
      </Button>
      {error && <Text sx={{ color: "ui.error" }}>{error}</Text>}
    </>
  );
};

export default withErrorBoundary(FulfillmentCard);
