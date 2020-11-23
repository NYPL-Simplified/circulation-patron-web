/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import BaseLink from "next/link";
import useLinkUtils from "hooks/useLinkUtils";
import { UrlObject } from "url";

export type Url = UrlObject | string;

type CollectionLinkProps = {
  collectionUrl: string;
};
type BookLinkProps = {
  bookUrl: string;
};
type OtherLinkProps = {
  href: Url;
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
 * converts bookUrl and collectionUrl to href props
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
  // if we are using a UrlObject, we assume the pathname is
  // already fully formed and we return it as is. This means that
  // when using a url object, you must pass /[library]/...yourpath
  // as the pathname.
  if (typeof props.href !== "string") {
    return props;
  }
  // otherwise we prepend the library to it.
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
      // default to shallow routing because we don't fetch any
      // page-specific data in getStaticProps. See more:
      // https://nextjs.org/docs/routing/shallow-routing
      shallow = true,
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
