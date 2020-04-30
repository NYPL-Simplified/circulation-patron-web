/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { BookData, LaneData } from "opds-web-client/lib/interfaces";
import useRecommendationsState from "../context/RecommendationsContext";
import BookCover from "../BookCover";
import LoadingIndicator from "../LoadingIndicator";
import Link from "../Link";
import { NavButton } from "../Button";

const Recommendations: React.FC<{ book: BookData }> = ({ book }) => {
  /**
   * TODO
   * - test multiple lanes
   */
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
  if (isFetching) {
    return (
      <div
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column"
        }}
      >
        <LoadingIndicator /> Loading recommendations...
      </div>
    );
  }
  return (
    <React.Fragment>
      {lanes.map(lane => (
        <RecommendationsLane key={lane.title} lane={lane} selfId={book.id} />
      ))}
    </React.Fragment>
  );
};

const RecommendationsLane: React.FC<{ lane: LaneData; selfId: string }> = ({
  selfId,
  lane: { title, books, url }
}) => {
  // if there are less than two books, show nothing
  if (books.length < 2) return null;

  return (
    <div sx={{ variant: "cards.bookDetails", border: "none" }}>
      <div
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Styled.h2 sx={{ fontSize: 2 }}>{title}</Styled.h2>
        <NavButton collectionUrl={url}>More...</NavButton>
      </div>

      <div
        sx={{
          border: "1px solid",
          borderColor: "primaries.dark",
          borderRadius: "card",
          p: 2,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center"
        }}
      >
        {books.map(
          book =>
            book.id !== selfId &&
            book.url && (
              <Link
                bookUrl={book.url}
                key={book.id}
                sx={{ flex: "1 0 auto", maxWidth: 110, m: 2 }}
              >
                <BookCover book={book} sx={{ m: 2, width: 100 }} />
                <Styled.h3
                  sx={{
                    variant: "text.bookTitle",
                    textAlign: "center",
                    fontSize: 2,
                    mt: 2,
                    mb: 0
                  }}
                >
                  {book.title}
                </Styled.h3>
              </Link>
            )
        )}
      </div>
    </div>
  );
};

const getRelatedUrl = (book: BookData): null | string => {
  if (!book) return null;

  const links = book.raw.link;
  if (!links) return null;

  const relatedLink = links.find(link => link.$.rel.value === "related");
  if (!relatedLink) return null;

  return relatedLink.$.href.value;
};

export default Recommendations;
