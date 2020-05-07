/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { NavButton } from "./Button";
import Head from "next/head";
import Layout from "../components/Layout";

const NoMatch = () => {
  return (
    <Layout>
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
        <NavButton href="/">Return home</NavButton>
      </div>
    </Layout>
  );
};

export default NoMatch;
