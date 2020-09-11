import * as React from "react";
import { BookData, FulfillmentLink } from "interfaces";
import useUser from "hooks/useUser";
import { fetchEntry } from "dataflow/opds1/fetch";
import { entryToBook } from "dataflow/opds1/parse";
import useLibraryContext from "components/context/LibraryContext";

export default function useBorrow(
  book: BookData,
  isBorrow: boolean,
  borrowLink: FulfillmentLink
) {
  const { catalogUrl } = useLibraryContext();
  const isUnmounted = React.useRef(false);
  const [isLoading, setLoading] = React.useState(false);
  const { setBook } = useUser();

  const loadingText = isBorrow ? "Borrowing..." : "Reserving...";
  const buttonLabel = isBorrow
    ? borrowLink.indirectType ===
      "application/vnd.librarysimplified.axisnow+json"
      ? "Borrow to read online"
      : "Borrow to read on a mobile device"
    : "Reserve";

  async function borrowOrReserve(url: string) {
    setLoading(true);
    const book = await borrowRequest(url, catalogUrl);
    // set the book manually in loans
    setBook(book);
    if (!isUnmounted.current) setLoading(false);
  }

  React.useEffect(
    () => () => {
      isUnmounted.current = true;
    },
    []
  );

  return {
    isLoading,
    loadingText,
    buttonLabel,
    borrowOrReserve
  };
}

async function borrowRequest(
  url: string,
  catalogUrl: string
): Promise<BookData> {
  const entry = await fetchEntry(url);
  const book = entryToBook(entry, catalogUrl);
  return book;
}
