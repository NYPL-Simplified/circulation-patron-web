/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useTypedSelector from "../hooks/useTypedSelector";
import Select, { Label } from "./Select";
import Router from "next/router";
import useLinkUtils from "./context/LinkUtilsContext";

/**
 * This filter depends on the "Sort by" and "Availability" facet groups.
 * They must be named exactly that in the CM in order to show up here.
 */
const ListFilters: React.FC = () => {
  return (
    <div sx={{ display: "flex", alignItems: "center" }}>
      <FacetSelector facetLabel="Sort by" />
      <FacetSelector facetLabel="Availability" />
    </div>
  );
};

const FacetSelector: React.FC<{ facetLabel: string }> = ({ facetLabel }) => {
  const facetGroup = useTypedSelector(state =>
    state.collection.data?.facetGroups?.find(
      facetGroup => facetGroup.label === facetLabel
    )
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
    const link = linkUtils.buildCollectionLink(facet.href);
    Router.push(link.href, link.as);
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
