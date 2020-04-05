/** @jsx jsx */
import { jsx } from "theme-ui";
import { Group } from "reakit";
import * as React from "react";
import useTypedSelector from "../hooks/useTypedSelector";
import { Book, Headset } from "../icons";
import FilterButton from "./FilterButton";
import { useRouter } from "next/router";

/**
 * This filter depends on the "Formats" facetGroup, which should have
 * at least two facets with labels:
 *  - Audiobooks
 *  - eBooks
 * It can optionally have an additional "All" facet. Note that the facet
 * labels must match the spelling and capitalization exactly.
 */
const FormatFilter: React.FC = () => {
  const router = useRouter();
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

  // test if we are at home or /collection/ and only show then.
  // also include multi-library cases.
  const isShowingCollection =
    ["/", "/[library]/", "/collection", "/[library]/collection"].indexOf(
      router.pathname
    ) !== -1;

  if (!isShowingCollection) return null;
  return (
