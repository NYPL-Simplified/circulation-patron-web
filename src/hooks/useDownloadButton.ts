import { MediaLink, FulfillmentLink, OPDS1 } from "interfaces";
import { typeMap } from "utils/file";

export function fixMimeType(
  mimeType: OPDS1.AnyBookMediaType | "vnd.adobe/adept+xml"
): OPDS1.AnyBookMediaType {
  return mimeType === "vnd.adobe/adept+xml"
    ? "application/vnd.adobe.adept+xml"
    : mimeType;
}

function isReadOnlineLink(
  link: MediaLink | FulfillmentLink
): link is FulfillmentLink {
  return (
    (link.type === "application/atom+xml;type=entry;profile=opds-catalog" &&
      (link as FulfillmentLink).indirectType === OPDS1.AtomMediaType) ||
    link.type === OPDS1.AxisNowWebpubMediaType
  );
}

type DownloadDetails = {
  fulfill: () => Promise<void>;
  downloadLabel: string;
  mimeType: OPDS1.AnyBookMediaType;
  fileExtension: string;
  isReadOnline: boolean;
};

export default function useDownloadButton(
  link: MediaLink | FulfillmentLink | undefined,
  title: string
): DownloadDetails | null {
  if (!link) {
    console.warn("No download link for", title);
    return null;
  }

  const mimeTypeValue = fixMimeType(link.type);

  const fileExtension = typeMap[mimeTypeValue]?.extension ?? "";

  const fulfill = async () => {
    console.error("IMPLEMENT FULFILL BOOOK");
    // if (isReadOnlineLink(link)) {
    //   const action = actions.indirectFulfillBook(link.url, link.indirectType);
    //   const url = await dispatch(action);
    //   window.open(url, "_blank");
    // } else {
    //   // TODO: use mimeType variable once we fix the link type in our
    //   // OPDS entries
    //   const action = actions.fulfillBook(link.url);
    //   const blob = await dispatch(action);
    //   download(
    //     blob,
    //     generateFilename(title ?? "untitled", fileExtension),
    //     mimeTypeValue
    //   );
    // }
  };

  const isReadOnline = isReadOnlineLink(link);
  const typeName = typeMap[mimeTypeValue]?.name;
  const downloadLabel = isReadOnline
    ? "Read Online"
    : `Download${typeName ? " " + typeName : ""}`;

  return {
    fulfill,
    isReadOnline,
    downloadLabel,
    mimeType: mimeTypeValue,
    fileExtension
  };
}
