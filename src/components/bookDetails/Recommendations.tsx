/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { BookData } from "opds-web-client/lib/interfaces";
import useRecommendationsState from "../context/RecommendationsContext";
import LoadingIndicator from "../LoadingIndicator";
import { H3, H2 } from "components/Text";
import Lane from "components/Lane";

const Recommendations: React.FC<{ book: BookData }> = ({ book }) => {
  const relatedUrl = getRelatedUrl(book);
  const {
    recommendationsState,
    recommendationsDispatch,
    recommendationsActions
  } = useRecommendationsState();

  // fetch the collection
  React.useEffect(() => {
    if (relatedUrl) {
      recommendationsDispatch(
        recommendationsActions.fetchCollection(relatedUrl)
      );
    }

    /**
     * This will be run on unmount, and before running the effect anytime
     * it is going to run.
     */
    return () => {
      recommendationsDispatch(recommendationsActions.clearCollection());
    };
    // will run on mount and anytime the relatedUrl changes.
    // other dependencies should never change.
  }, [recommendationsDispatch, recommendationsActions, relatedUrl]);

  // get the lanes data from state
  const lanes = recommendationsState?.data?.lanes ?? [];
  const isFetching = recommendationsState?.isFetching ?? false;
  if (!isFetching && lanes.length === 0) return null;
  return (
    <section
      aria-label="Recommendations"
      sx={{ bg: "ui.gray.lightWarm", py: 4 }}
    >
      <H2
        sx={{
          px: [3, 5],
          mt: 0,
          mb: 3,
          color: isFetching ? "ui.gray.dark" : "ui.black"
        }}
      >
        Recommendations{" "}
        {isFetching && <LoadingIndicator size="1.75rem" color="ui.gray.dark" />}
      </H2>
      <ul sx={{ listStyle: "none", m: 0, p: 0 }}>
        {!isFetching &&
          lanes.map(lane => {
            return (
              <Lane
                key={lane.title}
                lane={lane}
                titleTag={H3}
                omitIds={[book.id]}
              />
            );
          })}
      </ul>
    </section>
  );
};

const getRelatedUrl = (book: BookData): null | string => {
  if (!book) return null;

  const links = book.raw.link;
  if (!links) return null;

  const relatedLink = links.find((link: any) => link.$.rel.value === "related");

  if (!relatedLink) return null;

  return relatedLink.$.href.value;
};

export default Recommendations;
