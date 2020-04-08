/** @jsx jsx */
import { jsx, Flex } from "theme-ui";
import { Group } from "reakit";
import * as React from "react";
import useTypedSelector from "../hooks/useTypedSelector";
import { Route } from "react-router-dom";
import { Book, Headset } from "../icons";
import FilterButton from "./FilterButton";

/**
 * This filter depends on the "Formats" facetGroup, which should have
 * at least two facets with labels:
 *  - Audiobooks
 *  - eBooks
 * It can optionally have an additional "All" facet. Note that the facet
 * labels must match the spelling and capitalization exactly.
 */
const FormatFilter: React.FC = () => {
  const formatFacetGroup = useTypedSelector(state =>
    state.collection.data?.facetGroups?.find(
      facetGroup => facetGroup.label === "Formats"
    )
  );
  const ebookFacet = formatFacetGroup?.facets.find(
    facet => facet.label === "eBooks"
  );
  const audiobookFacet = formatFacetGroup?.facets.find(
    facet => facet.label === "Audiobooks"
  );
  const allFacet = formatFacetGroup?.facets.find(
    facet => facet.label === "All"
  );
  if (!ebookFacet || !audiobookFacet) return null;
  return (
    <Route
      path={[
        "/",
        "/collection/:collectionUrl",
        "/:library/",
        "/:library/collection/:collectionUrl"
      ]}
      exact
    >
      <Group role="tablist" sx={{ display: "flex", py: 0 }}>
        {allFacet && (
          <FilterButton
            collectionUrl={allFacet.href}
            selected={allFacet.active}
          >
            ALL
          </FilterButton>
        )}
        <FilterButton
          collectionUrl={ebookFacet.href}
          selected={!!ebookFacet.active}
          aria-label="Books"
        >
          <Book sx={{ fontSize: 4 }} />
        </FilterButton>
        <FilterButton
          aria-label="Audiobooks"
          collectionUrl={audiobookFacet.href}
          selected={!!audiobookFacet.active}
        >
          <Headset sx={{ fontSize: 4, m: 0, p: 0 }} />
        </FilterButton>
      </Group>
    </Route>
  );
};
export default FormatFilter;
