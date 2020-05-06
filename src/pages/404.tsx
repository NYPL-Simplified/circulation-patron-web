/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import Layout from "../components/Layout";
import { NavButton } from "../components/Button";

export default function Custom404() {
  return (
    <Layout>
      <Styled.h1 sx={{ fontSize: 3, textAlign: `center` }}>
        404: Page Not Found
      </Styled.h1>

      <p sx={{ textAlign: `center` }}>
        <NavButton sx={{ mt: 3 }} href="/">
          Return Home
        </NavButton>
      </p>
    </Layout>
  );
}
