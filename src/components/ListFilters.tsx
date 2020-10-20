/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Select from "./Select";
import Router from "next/router";
import { CollectionData, FacetGroupData } from "interfaces";
import FormLabel from "components/form/FormLabel";
import useLinkUtils from "hooks/useLinkUtils";

const ListFilters: React.FC<{ collection: CollectionData }> = ({
  collection
}) => {
  const { facetGroups } = collection;
  return (
    <div
      sx={{
        display: "flex",
        flexDirection: ["column", "row"],
        flexWrap: "wrap"
      }}
    >
      {facetGroups?.map(facetGroup => (
        <FacetSelector facetGroup={facetGroup} key={facetGroup.label} />
      ))}
    </div>
  );
};

const FacetSelector: React.FC<{
  facetGroup: FacetGroupData;
}> = ({ facetGroup }) => {
  const linkUtils = useLinkUtils();

  const { label, facets } = facetGroup;

  const activeFacet = facets.find(facet => !!facet.active);

  const handleChange = (e: React.FormEvent<HTMLSelectElement>) => {
    // just navigate to that facet.
    const facetLabel = e.currentTarget.value;
    const facet = facets.find(facet => facet.label === facetLabel);

    if (!facet?.href) return;
    const url = linkUtils.buildCollectionLink(facet.href);
    // shallow route because we don't need to rerun getStaticProps for the new page,
    // just fetch the new collection client-side
    Router.push(url, undefined, { shallow: true });
  };
  return (
    <div sx={{ m: 1 }}>
      <FormLabel sx={{ mb: 0 }} htmlFor={`facet-selector-${label}`}>
        {label}
      </FormLabel>
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
    </div>
  );
};
export default ListFilters;
