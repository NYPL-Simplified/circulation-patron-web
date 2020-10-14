/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import FormLabel from "./form/FormLabel";
import Router from "next/router";
import Select from "./Select";
import { CollectionData } from "interfaces";
import useLinkUtils from "hooks/useLinkUtils";

/**
 * This filter depends on the "Formats" facetGroup, which should have
 * at least two facets with labels:
 *  - Audiobooks
 *  - eBooks
 * It can optionally have an additional "All" facet. Note that the facet
 * labels must match the spelling and capitalization exactly.
 */
const FormatFilter: React.FC<{ collection: CollectionData }> = ({
  collection
}) => {
  const { buildCollectionLink } = useLinkUtils();

  const formatFacetGroup = collection?.facetGroups?.find(
    facetGroup => facetGroup.label === "Formats"
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

  if (!ebookFacet || !audiobookFacet) {
    // in order to display the format selector, you must have an audiobook and ebook filter set
    // up in the CM
    return null;
  }
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    // value will always be defined, but it could be an empty string.
    const collectionLink = buildCollectionLink(e.target.value);
    // check if value is defined?
    // if all facet isn't defined, go to the base url.
    Router.push(collectionLink);
  };

  const value = [allFacet, ebookFacet, audiobookFacet].find(
    facet => facet?.active
  )?.href;
  return (
    <div
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        width: "initial"
      }}
      role="group"
    >
      <FormLabel htmlFor="formatSelect">Format</FormLabel>
      <Select id="formatSelect" onChange={handleChange} value={value}>
        {allFacet && <option value={allFacet?.href}>All</option>}
        <option value={ebookFacet.href}>eBooks</option>
        <option value={audiobookFacet.href}>Audiobooks</option>
      </Select>
    </div>
  );
};
export default FormatFilter;
