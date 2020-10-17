import { LibraryData } from "../interfaces";
import { GetStaticProps } from "next";
import {
  getCatalogRootUrl,
  fetchCatalog,
  fetchAuthDocument,
  buildLibraryData
} from "dataflow/getLibraryData";
import ApplicationError, { PageNotFoundError } from "errors";
import { getAuthDocHref } from "utils/auth";
import { findSearchLink } from "dataflow/opds1/parse";
import { fetchSearchData } from "dataflow/opds1/fetch";
import extractParam from "dataflow/utils";

export type AppProps = {
  library?: LibraryData;
  error?: {
    message: string;
    name: string;
    statusCode: number | null;
  };
};

export default function withAppProps(
  pageGetServerSideProps?: GetStaticProps
): GetStaticProps<AppProps> {
  return async ctx => {
    /**
     * Determine the catalog url
     * Get library catalog
     * Fetch the auth document provided in it
     */
    try {
      const librarySlug = extractParam(ctx.params, "library");
      if (!librarySlug)
        throw new PageNotFoundError(
          "A library slug is required to be provided in the URL. Eg: https://domain.com/:library"
        );

      const catalogUrl = await getCatalogRootUrl(librarySlug);
      const catalog = await fetchCatalog(catalogUrl);
      const authDocHref = getAuthDocHref(catalog);
      const authDocument = await fetchAuthDocument(authDocHref);
      const searchDataUrl = findSearchLink(catalog)?.href;
      const searchData = await fetchSearchData(searchDataUrl);
      const library = buildLibraryData(
        authDocument,
        catalogUrl,
        librarySlug,
        catalog,
        searchData
      );
      // fetch the static props for the page
      const pageResult = (await pageGetServerSideProps?.(ctx)) ?? { props: {} };
      return {
        ...pageResult,
        props: {
          ...pageResult.props,
          library
        }
      };
    } catch (e) {
      if (e instanceof ApplicationError) {
        return {
          props: {
            error: {
              message: e.message,
              name: e.name,
              statusCode: e.statusCode
            }
          },
          // library data will be revalidated once per hour.
          revalidate: 60 * 60
        };
      }
      // otherwise we probably can't recover at all,
      // so rethrow.
      throw e;
    }
  };
}
