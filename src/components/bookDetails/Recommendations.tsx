/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import LoadingIndicator from "../LoadingIndicator";
import { H3, H2 } from "components/Text";
import Lane from "components/Lane";
import { AnyBook } from "interfaces";
import { fetchCollection } from "dataflow/opds1/fetch";
import useSWR from "swr";

const Recommendations: React.FC<{ book: AnyBook }> = ({ book }) => {
  const relatedUrl = book.relatedUrl;

  const { data: recommendations, isValidating } = useSWR(
    relatedUrl,
    fetchCollection
  );

  const isLoading = !recommendations && isValidating;

  // get the lanes data from state
  const lanes = recommendations?.lanes ?? [];

  // don't show if there are no lanes
  if (!isLoading && lanes.length === 0) return null;
  // also don't show if the lanes are empty or only contain 1
  // book. That 1 book is usually the book we are looking at.
  const hasBooks = lanes.reduce(
    (prev, lane) => (lane.books.length > 1 ? true : prev),
    false
  );
  if (!isLoading && !hasBooks) return null;

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
          color: isLoading ? "ui.gray.dark" : "ui.black"
        }}
      >
        Recommendations{" "}
        {isLoading && <LoadingIndicator size="1.75rem" color="ui.gray.dark" />}
      </H2>
      <ul sx={{ listStyle: "none", m: 0, p: 0 }}>
        {!isLoading &&
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

export default Recommendations;
