import { LibraryData, AppConfigFile } from "../interfaces";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import {
  getCatalogRootUrl,
  fetchCatalog,
  fetchAuthDocument,
  buildLibraryData,
  getAuthDocHref
} from "dataflow/getLibraryData";
import ApplicationError from "errors";
import getConfigFile from "./getConfigFile";
import { CONFIG_FILE } from "utils/env";

const getLibraryFromParams = (
  query: ParsedUrlQuery | undefined
): string | undefined => {
  const libraryQuery: string | string[] | undefined = query?.library;
  return libraryQuery
    ? typeof libraryQuery === "string"
      ? libraryQuery
      : libraryQuery[0]
    : undefined;
};

export type AppProps = {
  library?: LibraryData;
  error?: {
    message: string;
    name: string;
    statusCode: number | null;
  };
  configFile?: AppConfigFile | null;
};

export default function withAppProps(
  pageGetServerSideProps?: GetServerSideProps
): GetServerSideProps<AppProps> {
  return async ctx => {
    /**
     * Determine the catalog url
     * Get library catalog
     * Fetch the auth document provided in it
     */
    try {
      const librarySlug = getLibraryFromParams(ctx.params);
      const catalogUrl = await getCatalogRootUrl(librarySlug);
      const catalog = await fetchCatalog(catalogUrl);
      const authDocHref = getAuthDocHref(catalog);
      const authDocument = await fetchAuthDocument(authDocHref);
      const library = buildLibraryData(authDocument, catalogUrl, librarySlug);
      // fetch the static props for the page
      const pageResult = (await pageGetServerSideProps?.(ctx)) ?? { props: {} };
      return {
        ...pageResult,
        props: {
          ...pageResult.props,
          library
          // catalog
        }
      };
    } catch (e) {
      // if we are running with a config file, add it to the error
      let configFile: AppConfigFile | null = null;
      if (CONFIG_FILE) {
        try {
          configFile = await getConfigFile(CONFIG_FILE);
        } catch {
          configFile = null;
        }
      }

      if (e instanceof ApplicationError) {
        return {
          props: {
            error: {
              message: e.message,
              name: e.name,
              statusCode: e.statusCode
            },
            configFile
          }
        };
      }
      // otherwise we probably can't recover at all,
      // so rethrow.
      throw e;
    }
  };
}
