/** @jsx jsx */
import { jsx, Styled, Flex } from "theme-ui";
import * as React from "react";
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { LibraryData } from "../interfaces";
import Search from "./Search";
import { NavButton as NavButtonBase } from "./Button";
import useCatalogLink from "../hooks/useCatalogLink";
import Link from "./Link";
import BookIcon from "../icons/Book";
import useLibraryContext from "./context/LibraryContext";
import FormatFilter from "./FormatFilter";
import ViewSelector from "./ViewSelector";
import useTypedSelector from "../hooks/useTypedSelector";

export interface HeaderContext extends NavigateContext {
  library: LibraryData;
}

/**
 * will get the data it needs directly from context/
 * redux store instead of relying on OPDS web client to provide it
 */
const HeaderFC: React.FC<{ className?: string }> = ({ className }) => {
  const library = useLibraryContext();
  const homeUrl = useCatalogLink(undefined);
  const loansUrl = useTypedSelector(state => state.loans.url);

  return (
    <header
      sx={{
        display: "flex",
        flexDirection: ["column", "column", "row"],
        alignItems: ["stretch", "stretch", "flex-end"]
      }}
      className={className}
    >
      <Link
        sx={{
          display: "block",
          bg: "primary",
          color: "white",
          py: 2,
          textAlign: "center",
          padding: [2, 4]
        }}
        to={homeUrl}
      >
        <Styled.h2
          sx={{
            m: 0,
            mb: 1,
            fontSize: [2, 3]
          }}
        >
          {library.catalogName}
        </Styled.h2>
        <span
          sx={{
            fontSize: [0, 1],
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}
        >
          Library System
        </span>
      </Link>
      <Flex
        sx={{
          flexDirection: ["column", "row"],
          flexWrap: "wrap",
          alignItems: ["center", "flex-end"],
          justifyContent: "space-between",
          flex: 1
        }}
      >
        <Flex
          sx={{
            flexDirection: "row",
            justifyContent: "flex-start",
            flex: 1,
            p: [2, 0]
          }}
        >
          <NavButton
            sx={{ m: 1, mb: [1, 0] }}
            variant="primary"
            collectionUrl={loansUrl}
          >
            <BookIcon sx={{ fontSize: 5 }} /> My Books
          </NavButton>
          {/* uncomment to enable a settings button */}
          {/* <NavButton
            sx={{ m: 1, mb: [1, 0] }}
            variant="primary"
            to={"/settings"}
          >
            <SettingsIcon sx={{ fontSize: 5 }} /> Settings
          </NavButton> */}

          {/* uncomment to include links from the CM */}
          {/* <CMDefinedHeaderLinks library={library} /> */}
        </Flex>
        <FormatFilter />
        <ViewSelector />
        <Flex sx={{ justifyContent: "center", p: 2 }}>
          <Search />
        </Flex>
      </Flex>
    </header>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CMDefinedHeaderLinks: React.FC<{ library: LibraryData }> = ({
  library
}) => {
  return (
    <Flex
      as="ol"
      sx={{ flexDirection: "row", alignItems: "center", p: 0, m: 1 }}
    >
      {library?.headerLinks?.map(link => (
        <li sx={{ listStyle: "none" }} key={link.href}>
          <a href={link.href} title={link.title}>
            {link.title}
          </a>
        </li>
      ))}
    </Flex>
  );
};

export default HeaderFC;

type ButtonProps = React.ComponentProps<typeof NavButtonBase>;
const NavButton: React.FC<ButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <NavButtonBase
      sx={{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}
      className={className}
      {...props}
    >
      {children}
    </NavButtonBase>
  );
};
