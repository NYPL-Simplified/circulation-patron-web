import { LibraryData, OPDS1 } from "../interfaces";
import { GetStaticProps, GetStaticPropsContext } from "next";
import {
  getAuthDocUrl,
  fetchAuthDocument,
  buildLibraryData
} from "dataflow/getLibraryData";
import ApplicationError, { PageNotFoundError } from "errors";
import extractParam from "dataflow/utils";
import { ParsedUrlQuery } from "querystring";
import track from "analytics/track";

export type AppProps = {
  library?: LibraryData;
  error?: OPDS1.ProblemDocument;
};

export default function withAppProps(
  pageGetStaticProps?: GetStaticProps,
  defaultLibSlug?: string
): GetStaticProps<AppProps> {
  return async (ctx: GetStaticPropsContext<ParsedUrlQuery>) => {
    try {
      const librarySlug = defaultLibSlug
        ? defaultLibSlug
        : extractParam(ctx.params, "library");

      if (!librarySlug)
        throw new PageNotFoundError(
          "A library slug is required to be provided in the URL. Eg: https://domain.com/:library"
        );

      const authDocUrl = await getAuthDocUrl(librarySlug);
      const authDocument = await fetchAuthDocument(authDocUrl);
      const library = buildLibraryData(authDocument, librarySlug);
      // fetch the static props for the page
      const pageResult = (await pageGetStaticProps?.(ctx)) ?? { props: {} };
      return {
        ...pageResult,
        props: {
          ...pageResult.props,
          library
        },
        // revalidate library-wide data once per hour per route
        revalidate: 60 * 60
      };
    } catch (e) {
      // if it is not already an application error, wrap it in one
      const error =
        e instanceof ApplicationError
          ? e
          : new ApplicationError(
              {
                title: "App Startup Failure",
                detail: "Static props could not be fetched.",
                status: 500
              },
              e
            );
      track.error(error, { severity: "error" });
      return {
        props: {
          error: error.info
        },
        // library data will be revalidated often for error pages.
        revalidate: 1
      };
    }
  };
}
