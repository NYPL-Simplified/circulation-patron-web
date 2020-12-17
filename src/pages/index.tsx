import * as React from "react";
import { IS_OPEN_EBOOKS } from "utils/env";
import OpenEbooksLandingPage, {
  landingPageStaticProps
} from "components/OpenEbooksLanding";
import MultiLibraryHome from "components/MultiLibraryHome";

const HomePage = IS_OPEN_EBOOKS ? OpenEbooksLandingPage : MultiLibraryHome;

export const getStaticProps = IS_OPEN_EBOOKS
  ? landingPageStaticProps
  : undefined;

export default HomePage;
