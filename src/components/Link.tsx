/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import BaseLink from "next/link";
import useLinkUtils, { LinkUtils } from "./context/LinkUtilsContext";
import { NextLinkConfig } from "../interfaces";

type CollectionLinkProps = {
  collectionUrl: string;
};
type BookLinkProps = {
  bookUrl: string;
};

type BaseLinkProps = Omit<
  React.ComponentProps<typeof BaseLink>,
  "href" | "as"
> & {
  className?: string;
};

export type LinkProps = BaseLinkProps &
  (CollectionLinkProps | BookLinkProps | NextLinkConfig);

const buildLinkFromProps = (props: LinkProps, linkUtils: LinkUtils) => {
  if ("bookUrl" in props) {
    return linkUtils.buildBookLink(props.bookUrl);
  }
  if ("collectionUrl" in props) {
    return linkUtils.buildCollectionLink(props.collectionUrl);
  }
  return linkUtils.buildMultiLibraryLink({
    as: props.as,
    href: props.href
  });
};
/**
 * Extends next/Link to:
 *  - add styles
 *  - automatically prepend the library ID if using multiple libraries.
 *  - allows user to pass in ONE OF:
 *    - "href" and "as", a normal next/Link
 *    - "bookUrl"
 *    - "collectionUrl"
 */
const Link: React.FC<LinkProps> = React.forwardRef(
  ({ children, className, ...props }, ref: React.Ref<any>) => {
    const linkUtils = useLinkUtils();
    const { as, href } = buildLinkFromProps(props, linkUtils);

    return (
      <BaseLink href={href} as={as} passHref>
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
