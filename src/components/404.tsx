/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { NavButton } from "./Button";
import { Helmet } from "react-helmet-async";

const NoMatch = () => {
  return (
    <div
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Helmet>
        <title>404 Page not found</title>
      </Helmet>
      <Styled.h1>404: Page not found</Styled.h1>
      <p>
        We&apos;re sorry, but the page you are looking for does not exist.
        Please try a different URL or return to home.
      </p>
      <NavButton collectionUrl={undefined} bookUrl={undefined}>
        Return home
      </NavButton>
    </div>
  );
};

export default NoMatch;
