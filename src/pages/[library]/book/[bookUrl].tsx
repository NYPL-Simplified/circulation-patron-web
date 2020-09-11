import * as React from "react";
import BookDetails from "components/bookDetails";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import Page from "components/Page";
import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import extractParam from "dataflow/utils";
import {
  createBookUrl,
  fetchEntry,
  stripUndefined
} from "dataflow/opds1/fetch";
import { entryToBook } from "dataflow/opds1/parse";
import { BookData } from "opds-web-client/lib/interfaces";

type PageProps = {
  book?: BookData;
};

const BookPage: NextPage<AppProps & PageProps> = ({ library, book, error }) => {
  return (
    <Page library={library} error={error}>
      <BookDetails book={book} />
    </Page>
  );
};

export const getStaticProps: GetStaticProps = withAppProps(
  async ({ params }, { library }) => {
    const bookUrl = extractParam(params, "bookUrl");
    if (!bookUrl) throw Error("No book url present.");
    const fullBookUrl = createBookUrl(library.catalogUrl, bookUrl);
    const entry = await fetchEntry(fullBookUrl);
    const book = entryToBook(entry, library.catalogUrl);
    const withoutUndefined = stripUndefined(book);
    return {
      props: {
        book: withoutUndefined
      },
      revalidate: 5
    };
  }
);

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default BookPage;
