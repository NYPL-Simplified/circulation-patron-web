/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import Layout from "../components/Layout";
import { NavButton } from "../components/Button";

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <Layout>
      <Styled.h1 sx={{ fontSize: 3, textAlign: `center` }}>Error</Styled.h1>
      <p sx={{ textAlign: `center` }}>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : "An error occurred"}
        <br />
        <NavButton sx={{ mt: 3 }} href="/">
          Return Home
        </NavButton>
      </p>
    </Layout>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
