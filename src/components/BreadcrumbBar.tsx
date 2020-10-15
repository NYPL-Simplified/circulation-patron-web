/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Link from "./Link";
import List, { ListItem } from "./List";
import { LinkData } from "interfaces";
import useLibraryContext from "components/context/LibraryContext";

const BreadcrumbBar: React.FC<{
  className?: string;
  currentLocation?: string;
  breadcrumbs?: LinkData[];
}> = ({ children, className, currentLocation, breadcrumbs }) => {
  const { catalogUrl, catalogName } = useLibraryContext();

  const breadcrumbsWithAtLeastOne =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs
      : [{ text: catalogName, url: catalogUrl }];

  const lastItem = currentLocation ?? breadcrumbs?.pop()?.text;
  return (
    <div
      className={className}
      sx={{
        backgroundColor: "brand.primary",
        color: "ui.white",
        m: 0,
        p: 2,
        px: [3, 5],
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <List
        sx={{
          display: "flex",
          alignItems: "center",
          variant: "lists.unstyled",
          fontSize: "-1",
          flexWrap: "wrap",
          whiteSpace: "nowrap"
        }}
      >
        {breadcrumbsWithAtLeastOne.map(
          breadcrumb =>
            breadcrumb.text &&
            breadcrumb.url && (
              <ListItem key={breadcrumb.url}>
                <Link collectionUrl={breadcrumb.url}>{breadcrumb.text}</Link>
                &nbsp;/&nbsp;
              </ListItem>
            )
        )}
        <ListItem>{lastItem}</ListItem>
      </List>
      {children}
    </div>
  );
};

export default BreadcrumbBar;
