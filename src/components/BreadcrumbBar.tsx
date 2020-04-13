/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import useBreadCrumbs from "../hooks/useBreadcrumbs";
import { ArrowRight } from "../icons";
import { useGetCatalogLink } from "../hooks/useCatalogLink";
import Link from "./Link";

/**
 * A simple UI component to provide consistent
 * styling for the breadcrumb bar used in multiple
 * places.
 */
const BreadcrumbBar: React.FC<{
  className?: string;
  currentLocation?: string;
}> = ({ children, className, currentLocation }) => {
  const breadcrumbs = useBreadCrumbs();
  const lastItem = currentLocation ?? breadcrumbs.pop()?.text;
  const getCatalogLink = useGetCatalogLink();
  return (
    <div
      className={className}
      sx={{
        backgroundColor: "primaries.dark",
        color: "white",
        m: 0,
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <div
        sx={{
          display: "flex",
          alignItems: "center",
          textTransform: "uppercase"
        }}
      >
        {breadcrumbs.map(
          breadcrumb =>
            breadcrumb.text &&
            breadcrumb.url && (
              <Link
                to={getCatalogLink(undefined, breadcrumb.url)}
                key={breadcrumb.url}
              >
                <Styled.h2
                  sx={{
                    m: 0,
                    display: "flex",
                    alignItems: "center",
                    fontSize: [1, 3]
                  }}
                >
                  {breadcrumb.text} <ArrowRight sx={{ fill: "white" }} />
                </Styled.h2>
              </Link>
            )
        )}
        <Styled.h3 sx={{ m: 0, fontWeight: "light", fontSize: [1, 3] }}>
          {lastItem}
        </Styled.h3>
      </div>
      {children}
    </div>
  );
};

export default BreadcrumbBar;
