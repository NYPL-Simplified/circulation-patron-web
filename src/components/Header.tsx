/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { NavigateContext } from "owc/interfaces";
import { LibraryData } from "../interfaces";
import Search from "./Search";
import Button, { NavButton, AnchorButton } from "./Button";
import Link from "./Link";
import BookIcon from "../icons/Book";
import useLibraryContext from "./context/LibraryContext";
import { Text } from "./Text";
import Stack from "./Stack";
import SignOut from "./SignOut";
import useUser from "components/context/UserContext";
import useAuthModalContext from "auth/AuthModalContext";

export interface HeaderContext extends NavigateContext {
  library: LibraryData;
}

/**
 * will get the data it needs directly from context/
 * redux store instead of relying on OPDS web client to provide it
 */
const HeaderFC: React.FC<{ className?: string }> = ({ className }) => {
  const library = useLibraryContext();

  return (
    <header
      sx={{
        display: "flex",
        flexDirection: ["column", "column", "row"],
        alignItems: "stretch",
        px: [3, 5],
        py: 3
      }}
      className={className}
    >
      <Link
        href="/"
        aria-label="Library catalog, back to homepage"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: ["center", "flex-start"],
          textAlign: "center",
          p: 3,
          mb: [1, 0]
        }}
      >
        {library.logoUrl ? (
          <img src={library.logoUrl} alt={`${library.catalogName} Logo`} />
        ) : (
          <Text variant="text.headers.primary">{library.catalogName}</Text>
        )}
      </Link>
      <Stack
        direction="column"
        spacing={4}
        sx={{
          // flexDirection: "column",
          // flexWrap: "wrap",
          alignItems: ["stretch", "flex-end"],
          // justifyContent: "space-between",
          flex: 1
        }}
      >
        <HeaderLinks library={library} />
        <Search sx={{ minWidth: ["initial", 370], mr: [3, 0] }} />
      </Stack>
    </header>
  );
};

const HeaderLinks: React.FC<{ library: LibraryData }> = ({ library }) => {
  const { helpWebsite, libraryWebsite } = library.libraryLinks;
  const libraryName = library.catalogName;
  const { isAuthenticated, isLoading } = useUser();
  const { showModal } = useAuthModalContext();
  return (
    <div
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: ["center", "flex-end"]
      }}
    >
      {library?.headerLinks?.map(link => (
        <AnchorButton
          variant="ghost"
          color="ui.black"
          href={link.href}
          title={link.title}
          key={link.href}
        >
          {link.title}
        </AnchorButton>
      ))}
      {helpWebsite && (
        <AnchorButton
          variant="ghost"
          color="ui.black"
          href={helpWebsite.href}
          title="help"
        >
          Help
        </AnchorButton>
      )}
      {libraryWebsite && (
        <AnchorButton
          variant="ghost"
          color="ui.black"
          href={libraryWebsite.href}
          title="help"
          sx={{ whiteSpace: "initial" }}
        >
          {libraryWebsite.title ?? `${libraryName} Home`}
        </AnchorButton>
      )}
      <NavButton
        variant="ghost"
        color="ui.black"
        href="/loans"
        iconLeft={BookIcon}
        sx={{ mr: 1 }}
      >
        My Books
      </NavButton>
      {isAuthenticated ? (
        <SignOut />
      ) : (
        <Button onClick={showModal} loading={isLoading}>
          Sign In
        </Button>
      )}
    </div>
  );
};

export default HeaderFC;
