/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import Head from "next/head";

const NoMatch = () => {
  return (
    <>
      {" "}
      <div
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Head>
          <title>404 Page not found</title>
        </Head>
        <Styled.h1>404: Page not found</Styled.h1>
        <p>
          We&apos;re sorry, but the page you are looking for does not exist.
          Please try a different URL or return to home.
        </p>
      </div>
    </>
  );
};

export default NoMatch;
