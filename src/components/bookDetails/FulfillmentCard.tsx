/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { getAvailabilityString } from "../../utils/book";
import { sidebarWidth } from "./index";
import {
  BookData,
  MediaType,
  MediaLink,
  FulfillmentLink
} from "opds-web-client/lib/interfaces";
import { typeMap } from "opds-web-client/lib/utils/file";
import { RequiredKeys } from "../../interfaces";
import {
  bookIsBorrowed,
  bookIsOpenAccess,
  bookIsBorrowable
} from "opds-web-client/lib/utils/book";
import Button from "../Button";
import useDownloadButton from "opds-web-client/lib/hooks/useDownloadButton";
import { withErrorBoundary } from "../ErrorBoundary";
import Select, { Label } from "../Select";
import useBorrow from "../../hooks/useBorrow";

/**
 * This card will handle logic to download books. There are a few cases
 *  1.  It is open access, in which case show download button for different
 *      formats.
 *
 *  2.  It is not open-access. We need to first borrow the book then allow
 *      patrons to download in different formats.
 *
 *      - It is not borrowed
 *        - It is not on hold
 *          - It is available to be on hold
 *          - It is not available
 *        - It is on hold
 *      - It is borrowed
 *
 * Maybe this would be better as a state map... where you have an object that
 * maps states to a display?
 */
const FulfillmentCard: React.FC<{ book: BookData; className?: string }> = ({
  book,
  className
}) => {
  /**
   * If there are openAccessLinks, we display those and nothing else.
   * Otherwise, patrons need to borrow the book before downloading.
   */
  if (bookIsOpenAccess(book)) {
    const availability = getAvailabilityString(book);
    return (
      <DownloadCard
        className={className}
        links={book.openAccessLinks}
        availability={availability}
        title={book.title}
        isOpenAccess={true}
      />
    );
  }
  // if the book is borrowed already, show download options
  if (bookIsBorrowed(book)) {
    const availability = getAvailabilityString(book);
    return (
      <DownloadCard
        className={className}
        links={book.fulfillmentLinks}
        availability={availability}
        title={book.title}
      />
    );
  }
  // if the book either on hold, available, or reservable
  if (bookIsBorrowable(book)) {
    return <BorrowCard className={className} book={book} />;
  }
  // the book cannot be borrowed, something likely went wrong
  console.error("Something went wrong in the FulfillmentCard");
  return null;
};

/**
 *  Specifically handles the case where it has yet to be borrowed.
 */
const BorrowCard: React.FC<{
  book: RequiredKeys<BookData, "borrowUrl">;
  className?: string;
}> = ({ book, className }) => {
  const {
    availability,
    borrowOrReserve,
    isReserved,
    errorMsg,
    label,
    isLoading
  } = useBorrow(book);
  return (
    <CardWrapper
      className={className}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        px: 2,
        py: 3
      }}
    >
      {availability}
      {errorMsg && <p sx={{ color: "warn" }}>Error: {errorMsg}</p>}
      <Button
        onClick={borrowOrReserve}
        disabled={isReserved || isLoading}
        sx={{ my: 3 }}
      >
        {label}
      </Button>
    </CardWrapper>
  );
};

type MimetypeToLinkMap = {
  [key in MediaType]?: MediaLink | FulfillmentLink;
};
/**
 * Handles the case where it is ready for download either via openAccessLink or
 * via fulfillmentLink.
 */
const DownloadCard: React.FC<{
  links: MediaLink[] | FulfillmentLink[];
  availability: string;
  title: string;
  isOpenAccess?: boolean;
  className?: string;
}> = ({ links, availability, title, isOpenAccess = false, className }) => {
  // for some reason there are duplicate links. Dedupe them w a map by mimeType
  const linksByMimetype: MimetypeToLinkMap = {};
  links.forEach(link => (linksByMimetype[link.type] = link));

  const defaultType = links[0].type;
  const [selectedType, setSelectedType] = React.useState<MediaType>(
    defaultType
  );

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.currentTarget.value as MediaType);
  };

  const currentLink = linksByMimetype[selectedType];
  const downloadDetails = useDownloadButton(currentLink, title);

  if (!downloadDetails) return null;
  return (
    <CardWrapper className={className}>
      <div
        sx={{
          px: 2,
          py: 3,
          borderBottom: "1px solid",
          borderColor: "primary"
        }}
      >
        <div
          sx={{ fontWeight: "semibold", display: "flex", alignItems: "center" }}
        >
          <Label htmlFor="format-select">TYPE</Label>
          <Select
            id="format-select"
            value={selectedType}
            onBlur={handleTypeChange}
            onChange={handleTypeChange}
            sx={{ ml: 2 }}
          >
            {Object.keys(linksByMimetype).map(mediaType => (
              <option key={mediaType} value={mediaType}>
                {typeMap[mediaType]?.name ?? mediaType}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div sx={{ mb: 2, textAlign: "center" }}>{availability}</div>
        {isOpenAccess ? (
          <Styled.a
            target="__blank"
            rel="noopener noreferrer"
            href={linksByMimetype[selectedType]?.url}
            sx={{ variant: "buttons.accent", px: 2, py: 1 }}
          >
            Download
          </Styled.a>
        ) : (
          <Button onClick={downloadDetails.fulfill}>Download</Button>
        )}
      </div>
    </CardWrapper>
  );
};

const CardWrapper: React.FC<{ className?: string }> = ({
  children,
  className
}) => {
  return (
    <div
      aria-label="Borrow and download card"
      className={className}
      sx={{
        border: "1px solid",
        borderColor: "primary",
        borderRadius: "card",
        maxWidth: sidebarWidth,
        m: 2
      }}
    >
      {children}
    </div>
  );
};

const ErrorFallback: React.FC<{ message: string }> = ({ message }) => {
  return (
    <CardWrapper
      sx={{
        textAlign: "center",
        backgroundColor: "warn",
        color: "white",
        p: 2
      }}
    >
      <p>{message}</p>
    </CardWrapper>
  );
};

export default withErrorBoundary(FulfillmentCard, ErrorFallback);
