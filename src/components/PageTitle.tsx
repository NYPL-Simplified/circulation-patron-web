/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { H1 } from "./Text";
import { CollectionData } from "interfaces";
import ListFilters from "components/ListFilters";

const PageTitle: React.FC<{ collection?: CollectionData }> = ({
  children,
  collection
}) => {
  return (
    <div
      sx={{
        px: [3, 5],
        mt: 4,
        display: "flex",
        flexDirection: ["column", "column", "row"],
        justifyContent: ["flex-start", "space-between"],
        alignItems: ["stretch", "stretch", "flex-end"],
        mb: [0, 0, 4]
      }}
    >
      <H1 sx={{ mb: [3, 3, 0] }}>{children}</H1>
      {collection && <ListFilters collection={collection} />}
    </div>
  );
};

export default PageTitle;
