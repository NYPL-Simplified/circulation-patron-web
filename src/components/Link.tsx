/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import BaseLink from "next/link";
import { useGetCatalogLink } from "../hooks/useCatalogLink";

type BaseLinkProps = React.ComponentProps<typeof BaseLink>;

type CatalogLinkProps = Omit<BaseLinkProps, "href"> & {
  collectionUrl?: string | null;
  bookUrl?: string | null;
};
type LinkProps = {
  ref?: React.Ref<any>;
  children?: React.ReactNode;
  className?: string;
} & (BaseLinkProps | CatalogLinkProps);

function isBaseLinkProps(props: LinkProps): props is BaseLinkProps {
  return !!(props as BaseLinkProps).href;
}

/**
 * Extends the react router link to:
 *  - add styles
 *  - allow user to optionally pass in a collectionUrl/bookUrl combo
 *    and let the link compute the "to" prop
 */

const Link: React.FC<LinkProps> = React.forwardRef(
  ({ children, className, ...props }, ref: React.Ref<any>) => {
    const getCatalogLink = useGetCatalogLink();
    const computedHref = isBaseLinkProps(props)
      ? props.href
      : getCatalogLink(props.bookUrl, props.collectionUrl);

    return (
      <BaseLink href={computedHref}>
        <Styled.a
          ref={ref}
          sx={{ textDecoration: "none", color: "inherit" }}
          className={className}
        >
          {children}
        </Styled.a>
      </BaseLink>
    );
  }
);

export default Link;
