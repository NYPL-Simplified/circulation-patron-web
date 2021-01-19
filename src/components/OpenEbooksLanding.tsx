/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { H2, Text } from "./Text";
import Button, { NavButton } from "./Button";
import Stack from "./Stack";
import useUser from "./context/UserContext";
import { SignOut } from "./SignOut";
import SvgChevronRight from "icons/ExpandMore";
import { GetStaticProps, NextPage } from "next";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import Page from "components/Page";
import Footer from "components/Footer";
import GlobalStyles from "components/GlobalStyles";
import { ErrorBoundary } from "components/ErrorBoundary";
import { APP_CONFIG } from "utils/env";
import OpenEbooksLoginPicker from "auth/OpenEbooksLoginPicker";

type PopularBook = { alt: string; imgHref: string };

const popularBooks = {
  EarlyGrades: [
    { alt: "book cover text 1", imgHref: "/img/earlygrades-1.jpg" },
    { alt: "book cover text 1", imgHref: "/img/earlygrades-2.jpg" },
    { alt: "book cover text 1", imgHref: "/img/earlygrades-3.jpg" }
  ],
  MiddleGrades: [
    { alt: "book cover text 1", imgHref: "/img/middlegrades-1.jpg" },
    { alt: "book cover text 1", imgHref: "/img/middlegrades-2.jpg" },
    { alt: "book cover text 1", imgHref: "/img/middlegrades-3.jpg" }
  ],
  HighSchool: [
    { alt: "book cover text 1", imgHref: "/img/highschool-1.jpg" },
    { alt: "book cover text 1", imgHref: "/img/highschool-2.jpg" },
    { alt: "book cover text 1", imgHref: "/img/highschool-3.jpg" }
  ]
};

const LandingPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <Page library={library} error={error}>
      <ErrorBoundary>
        <GlobalStyles />
        <OpenEbooksLandingComponent />
        <Footer />
      </ErrorBoundary>
    </Page>
  );
};

export const OpenEbooksLandingComponent = () => {
  return (
    <div
      sx={{
        marginRight: 0,
        flex: "1 1 auto",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <OpenEbooksHero />
      <div
        sx={{
          flex: "2",
          maxWidth: 1100,
          mx: "auto",
          my: 4,
          textAlign: "center"
        }}
      >
        <div
          sx={{
            mx: [2, 4]
          }}
        >
          <H2>Lorem Ipsum Secondary Headline Welcome Openebooks</H2>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </Text>
        </div>
      </div>
      <OpenEbooksLoginPicker />
      <div
        sx={{
          backgroundColor: "brand.primary"
        }}
      >
        <div
          sx={{
            maxWidth: 1100,
            textAlign: ["center", "center", "left"],
            mx: "auto",
            display: "flex",
            flexWrap: "wrap",
            flexDirection: ["column", "column", "row"]
          }}
        >
          <div
            sx={{
              flex: "1",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <img
              sx={{ alignItems: "flex-end" }}
              alt="Mobile Device with Open Ebooks"
              src={"/img/SimplyEIpad.png"}
            />
          </div>
          <div
            sx={{
              flex: "2",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <Stack
              direction="column"
              sx={{
                justifyContent: "center",
                my: 4,
                mx: [2, 4],
                color: "ui.white"
              }}
            >
              <H2>Open e-Books Mobile Shoutout Here</H2>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </Text>
            </Stack>
          </div>
        </div>
      </div>
      <PopularBookSection books={popularBooks.HighSchool}>
        <H2>Popular High School Books</H2>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </Text>
      </PopularBookSection>
      <PopularBookSection
        books={popularBooks.MiddleGrades}
        coverLocation="right"
      >
        <H2>Popular Middle Grades Books</H2>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </Text>
      </PopularBookSection>
      <PopularBookSection books={popularBooks.EarlyGrades}>
        <H2>Popular Early Grades Books</H2>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </Text>
      </PopularBookSection>

      <div sx={{ backgroundColor: "brand.primary" }}>
        <div
          sx={{
            maxWidth: 1100,
            mx: "auto",
            my: 4,
            textAlign: "center",
            color: "ui.white"
          }}
        >
          <Stack sx={{ m: 2 }} direction="column">
            <H2>FAQ</H2>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.{" "}
            </Text>

            <Button
              sx={{ alignSelf: "center" }}
              variant="filled"
              color="ui.white"
            >
              <span sx={{ color: "ui.black" }}>Learn More</span>
            </Button>
          </Stack>
        </div>
      </div>
    </div>
  );
};

/**
 * Components in the Landing Page
 */

const OpenEbooksHero: React.FC = () => {
  const { isAuthenticated } = useUser();

  return (
    <div
      sx={{
        backgroundImage: `url('/img/HeroImage.jpg')`,
        minHeight: "350px",
        flexWrap: "nowrap",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        sx={{
          minHeight: "350px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div sx={{ display: "flex", margin: 3, justifyContent: "flex-end" }}>
          {isAuthenticated ? (
            <>
              <NavButton
                variant="ghost"
                color="ui.white"
                href="/"
                sx={{ mr: 1 }}
              >
                Catalog
              </NavButton>
              <SignOut color="ui.white" />
            </>
          ) : (
            <NavButton variant="filled" color="ui.white" href="/login">
              <span sx={{ color: "ui.black" }}>Log In</span>
            </NavButton>
          )}
        </div>
        <div
          sx={{
            margin: "auto",
            maxWidth: "1100"
          }}
        >
          <img
            sx={{
              mx: "auto"
            }}
            alt="Open Ebooks Logo"
            src="/img/OpenEbooksLogo.png"
          />
        </div>
        {/* The down arrow that goes to the login section */}
        <div sx={{ display: "flex", alignItems: "center" }}>
          <a
            href="#loginRegion"
            sx={{
              backgroundColor: "ui.white",
              margin: "auto",
              textAlign: "center",
              borderRadius: "25px 25px 0 0",
              display: "flex",
              paddingTop: "5px"
            }}
          >
            <SvgChevronRight sx={{ width: "50px", height: "25px" }} />
          </a>
        </div>
      </div>
    </div>
  );
};

const PopularBookSection: React.FC<{
  books: PopularBook[];
  coverLocation?: "left" | "right";
}> = ({ children, books, coverLocation }) => {
  return (
    <section
      sx={{
        px: "8.5%",
        my: [3, 3, 4],
        display: "flex",
        flexDirection: [
          "column",
          "column",
          coverLocation === "right" ? "row" : "row-reverse"
        ],
        ":first-of-type": {
          marginTop: [4, 4, 6]
        }
      }}
    >
      <aside
        sx={{
          flex: 1,
          alignSelf: "center",
          paddingLeft: [0, 0, coverLocation === "right" ? 0 : 5],
          paddingRight: [0, 0, coverLocation === "right" ? 5 : 0],
          marginBottom: [3, 3, 0],
          textAlign: ["center", "center", "left"]
        }}
      >
        {children}
      </aside>

      {/* The three book covers */}
      <div
        sx={{
          display: "flex",
          flex: 2,
          flexWrap: "nowrap",
          justifyContent: "space-between"
        }}
      >
        {books.map(book => {
          return (
            <img
              key={book.imgHref}
              sx={{
                boxShadow: theme =>
                  `-5px 5px 0px 0px ${theme.colors.brand.secondary}`,
                width: "32%",
                alignSelf: "flex-start"
              }}
              alt={book.alt}
              src={book.imgHref}
            />
          );
        })}
      </div>
    </section>
  );
};

export default LandingPage;

export const landingPageStaticProps: GetStaticProps = withAppProps(
  undefined,
  APP_CONFIG.openebooks?.defaultLibrary
);
