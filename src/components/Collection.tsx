/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import useTypedSelector from "../hooks/useTypedSelector";
import { SetCollectionAndBook } from "../interfaces";
import useSetCollectionAndBook from "../hooks/useSetCollectionAndBook";
import { connect } from "react-redux";
import {
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
} from "opds-web-client/lib/components/mergeRootProps";
import { PageLoader } from "../components/LoadingIndicator";
import useNormalizedCollection from "../hooks/useNormalizedCollection";
import { GalleryView, ListView, LanesView } from "./BookList";
import useView from "./context/ViewContext";
import ListFilters from "./ListFilters";
import Head from "next/head";

export const Collection: React.FC<{
  setCollectionAndBook: SetCollectionAndBook;
}> = ({ setCollectionAndBook }) => {
  useSetCollectionAndBook(setCollectionAndBook);
  const { view } = useView();
  // the first hook just provides the collection, the second subs in loaned book data if existing
  const collection = useTypedSelector(state => state.collection);
  const collectionData = useNormalizedCollection();

  if (collection.isFetching) {
    return <PageLoader />;
  }

  // if we have lanes, show them
  if (collectionData?.lanes && collectionData.lanes.length > 0) {
    const lanes = collectionData?.lanes ?? [];
    return (
      <div>
        <Head>
          <title>{collectionData.title}</title>
        </Head>
        <LanesView lanes={lanes} />
      </div>
    );
  }
  // alternatively, we might have books instead
  if (collectionData?.books && collectionData.books.length > 0) {
    const books = collectionData.books;
    return (
      <React.Fragment>
        <Head>
          <title>{collectionData.title}</title>
        </Head>
        {view === "LIST" ? (
          <ListView books={books} breadcrumb={<ListFilters />} />
        ) : (
          <GalleryView books={books} breadcrumb={<ListFilters />} />
        )}
      </React.Fragment>
    );
  }

  // otherwise it is empty
  return (
    <div
      sx={{
        display: "flex",
        flex: "1 1 auto",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Styled.h3 sx={{ color: "primaries.medium", fontStyle: "italic" }}>
        This collection is empty.
      </Styled.h3>
    </div>
  );
};

const Connected = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(Collection);

export default Connected;
