/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import BaseLink from "next/link";
import useLinkUtils from "hooks/useLinkUtils";

type CollectionLinkProps = {
  collectionUrl: string;
};
type BookLinkProps = {
  bookUrl: string;
};
type OtherLinkProps = {
  href: string;
};

type BaseLinkProps = Omit<
  React.ComponentProps<typeof BaseLink>,
  "href" | "as"
> &
  Omit<React.ComponentPropsWithoutRef<"a">, "href"> & {
    className?: string;
  };

export type LinkProps = BaseLinkProps &
  (CollectionLinkProps | BookLinkProps | OtherLinkProps);

/**
 * converts bookUrl and collectionUrl to as/href props
 * prepends with multi library path if needed
 * removes consumed props and returns normalized props
 */
const buildLinkFromProps = (
  props: LinkProps,
  linkUtils: ReturnType<typeof useLinkUtils>
) => {
  if ("bookUrl" in props) {
    const { bookUrl, ...rest } = props;
    return { href: linkUtils.buildBookLink(bookUrl), ...rest };
  }
  if ("collectionUrl" in props) {
    const { collectionUrl, ...rest } = props;
    return { href: linkUtils.buildCollectionLink(collectionUrl), ...rest };
  }
  const { href, ...rest } = props;
  return { href: linkUtils.buildMultiLibraryLink(href), ...rest };
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
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ children, className, ...props }, ref) => {
    const linkUtils = useLinkUtils();
    const {
      href,
      prefetch,
      replace,
      scroll,
      shallow,
      ...rest
    } = buildLinkFromProps(props, linkUtils);
    return (
      <BaseLink
        href={href}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        passHref
      >
        <a
          ref={ref}
          sx={{
            textDecoration: "none",
            color: "inherit",
            "&:hover": { color: "inherit", textDecoration: "underline" }
          }}
          className={className}
          {...rest}
        >
          {children}
        </a>
      </BaseLink>
    );
  }
);

export default Link;
