/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import {
  AnyFullfillment,
  DownloadFulfillment,
  ReadExternalFulfillment,
  ReadInternalFulfillment
} from "utils/fulfill";
import { FulfillableBook } from "interfaces";
import track from "analytics/track";
import SvgDownload from "icons/Download";
import SvgExternalLink from "icons/ExternalOpen";
import { useRouter } from "next/router";
import { Text } from "components/Text";
import Button from "components/Button";
import useLibraryContext from "components/context/LibraryContext";
import useUser from "components/context/UserContext";
import downloadFile from "dataflow/download";
import useError from "hooks/useError";
import useLinkUtils from "hooks/useLinkUtils";

const FulfillmentButton: React.FC<{
  details: AnyFullfillment;
  book: FulfillableBook;
  isPrimaryAction: boolean;
}> = ({ details, book, isPrimaryAction }) => {
  switch (details.type) {
    case "download":
      return (
        <DownloadButton
          details={details}
          title={book.title}
          isPrimaryAction={isPrimaryAction}
        />
      );
    case "read-online-internal":
      return (
        <ReadOnlineInternal
          details={details}
          isPrimaryAction={isPrimaryAction}
          trackOpenBookUrl={book.trackOpenBookUrl}
        />
      );
    case "read-online-external":
      return (
        <ReadOnlineExternal
          details={details}
          isPrimaryAction={isPrimaryAction}
          trackOpenBookUrl={book.trackOpenBookUrl}
        />
      );
    case "unsupported":
      return null;
  }
};

export default FulfillmentButton;

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
  details: ReadExternalFulfillment;
  isPrimaryAction: boolean;
  trackOpenBookUrl: string | null;
}> = ({ details, isPrimaryAction, trackOpenBookUrl }) => {
  const { catalogUrl } = useLibraryContext();
  const { token } = useUser();
  const [loading, setLoading] = React.useState(false);
  const { error, handleError, clearError } = useError();

  async function open() {
    setLoading(true);
    clearError();
    try {
      // the url may be behind indirection, so we fetch it with the
      // provided function
      const url = await details.getUrl(catalogUrl, token);
      // we are about to open the book, so send a track event
      track.openBook(trackOpenBookUrl);
      setLoading(false);
      window.open(url, "__blank");
    } catch (e) {
      setLoading(false);
      handleError(e);
    }
  }

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
  details: ReadInternalFulfillment;
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
  details: DownloadFulfillment;
  title: string;
  isPrimaryAction: boolean;
}> = ({ details, title, isPrimaryAction }) => {
  const { buttonLabel } = details;
  const [loading, setLoading] = React.useState(false);
  const { error, handleError, clearError } = useError();
  const { catalogUrl } = useLibraryContext();
  const { token } = useUser();

  async function download() {
    setLoading(true);
    clearError();
    try {
      const url = await details.getUrl(catalogUrl, token);
      await downloadFile(url, title, details.contentType, token);
    } catch (e) {
      setLoading(false);
      handleError(e);
    }
    setLoading(false);
  }

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
