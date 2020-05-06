/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import Layout from "../components/Layout";
import { NavButton } from "../components/Button";

function Error({
  statusCode,
  title,
  detail
}: {
  statusCode?: number;
  title?: string;
  detail?: string;
}) {
  return (
    <Layout>
      <Styled.h1 sx={{ fontSize: 3, textAlign: `center` }}>
        Error{title && `: ${title}`}
      </Styled.h1>
      <p sx={{ textAlign: `center` }}>
        {statusCode
          ? `A ${statusCode} error occurred on server`
          : "An error occurred"}
      </p>
      <p sx={{ textAlign: `center` }}>
        {detail && `${detail}`} <br />
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
