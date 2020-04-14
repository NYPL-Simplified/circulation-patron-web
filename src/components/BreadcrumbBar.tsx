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
      <ul
        sx={{
          display: "flex",
          alignItems: "center",
          textTransform: "uppercase",
          variant: "lists.unstyled"
        }}
      >
        {breadcrumbs.map(
          breadcrumb =>
            breadcrumb.text &&
            breadcrumb.url && (
              <li>
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
              </li>
            )
        )}
        <li>
          <Styled.h3 sx={{ m: 0, fontWeight: "light", fontSize: [1, 3] }}>
            {lastItem}
          </Styled.h3>
        </li>
      </ul>
      {children}
    </div>
  );
};

export default BreadcrumbBar;
