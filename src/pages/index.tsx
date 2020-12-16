import * as React from "react";
import { APP_CONFIG } from "utils/env";
import OpenEbooksLandingPage, {
  landingPageStaticProps
} from "components/OpenEbooksLanding";
import ErrorComponent from "components/Error";

const hasHomePage = APP_CONFIG.companionApp === "openebooks";

const HomePage = hasHomePage
  ? OpenEbooksLandingPage
  : () => (
      <ErrorComponent
        info={{
          title: "Page Not Found",
          status: 404,
          detail:
            "This app does not have a home page. Url should contain a library slug: https://domain.com/<library>"
        }}
      />
    );

export const getStaticProps = hasHomePage ? landingPageStaticProps : undefined;

export default HomePage;
