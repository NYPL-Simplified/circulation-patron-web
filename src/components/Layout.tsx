/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import GlobalStyles from "./GlobalStyles";
import Header from "./Header";
import Footer from "./Footer";
import SkipNavigation from "./SkipNavigation";

export const CONTENT_ID = "cpw-content";
/**
 * Will take over from opds-web-client to handle layout
 * of the app: header, main, footer. Will import from
 * opds web client as necessary
 *
 * How will it handle the data that opds<Root> is passing in to
 * each of the components it renders? Should that be available in
 * context or should it be passed via render prop or what?
 */

const Layout: React.FC<{ showFormatFilter?: boolean }> = ({
  children,
  showFormatFilter = false
}) => {
  return (
    <Styled.root
      sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <SkipNavigation />
      <GlobalStyles />
      <Header sx={{ width: "100%" }} showFormatFilter={showFormatFilter} />
      <main
        id={CONTENT_ID}
        sx={{
          flex: "1 1 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {children}
      </main>
      <Footer sx={{ width: "100%" }} />
    </Styled.root>
  );
};

export default Layout;
