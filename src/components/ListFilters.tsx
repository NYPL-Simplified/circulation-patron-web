/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Select, { Label } from "./Select";
import Router from "next/router";
import { CollectionData } from "interfaces";
import useLinkUtils from "hooks/useLinkUtils";

/**
 * This filter depends on the "Sort by" and "Availability" facet groups.
 * They must be named exactly that in the CM in order to show up here.
 */
const ListFilters: React.FC<{ collection: CollectionData }> = ({
  collection
}) => {
  return (
    <div sx={{ display: "flex", alignItems: "center" }}>
      <FacetSelector collection={collection} facetLabel="Sort by" />
      <FacetSelector collection={collection} facetLabel="Availability" />
    </div>
  );
};

const FacetSelector: React.FC<{
  facetLabel: string;
  collection: CollectionData;
}> = ({ facetLabel, collection }) => {
  const facetGroup = collection?.facetGroups?.find(
    facetGroup => facetGroup.label === facetLabel
  );

  const linkUtils = useLinkUtils();
  if (!facetGroup) return null;

  const { label, facets } = facetGroup;

  const activeFacet = facets.find(facet => !!facet.active);

  const handleChange = (e: React.FormEvent<HTMLSelectElement>) => {
    // just navigate to that facet.
    const facetLabel = e.currentTarget.value;
    const facet = facets.find(facet => facet.label === facetLabel);

    if (!facet?.href) return;
    const url = linkUtils.buildCollectionLink(facet.href);
    Router.push(url);
  };
  return (
    <React.Fragment>
      <Label htmlFor={`facet-selector-${label}`} sx={{ ml: 3, mr: 2 }}>
        {label}
      </Label>
      <Select
        id={`facet-selector-${label}`}
        value={activeFacet?.label}
        onBlur={handleChange}
        onChange={handleChange}
      >
        {facets.map(facet => (
          <option key={facet.label} value={facet.label}>
            {facet.label}
          </option>
        ))}
      </Select>
    </React.Fragment>
  );
};
export default ListFilters;
