/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import ExternalLink from "./ExternalLink";
import useLibraryContext from "./context/LibraryContext";
import List, { ListItem } from "./List";
import { H3, Text } from "./Text";
import { NavButton } from "./Button";
import SvgPhone from "icons/Phone";
import IosBadge from "./storeBadges/IosBadge";
import GooglePlayBadge from "./storeBadges/GooglePlayBadge";
import { NEXT_PUBLIC_COMPANION_APP } from "../utils/env";

const Footer: React.FC<{ className?: string }> = ({ className }) => {
  const library = useLibraryContext();
  const {
    helpEmail,
    helpWebsite,
    privacyPolicy,
    tos,
    about,
    registration,
    libraryWebsite
  } = library.libraryLinks;
  const title = library.catalogName;

  return (
    <footer
      sx={{
        bg: "ui.gray.extraLight",
        px: [3, 5],
        pb: 7,
        display: "flex",
        flexWrap: "wrap"
      }}
      className={className}
    >
      <div sx={{ flex: "0 0 auto", mt: 5, mr: 5 }}>
        <H3 sx={{ mt: 0, maxWidth: "100%" }}>{title}</H3>
        <FooterList>
          {libraryWebsite && (
            <ListItem>
              <FooterExternalLink href={libraryWebsite.href}>
                Library Homepage
              </FooterExternalLink>
            </ListItem>
          )}
          <ListItem>
            <NavButton variant="link" href="/loans" color="ui.black">
              My Books
            </NavButton>
          </ListItem>
          <ListItem>
            {registration && (
              <FooterExternalLink href={registration.href}>
                Need a library card?
              </FooterExternalLink>
            )}
          </ListItem>
          {privacyPolicy && (
            <ListItem>
              <FooterExternalLink href={privacyPolicy.href}>
                Privacy
              </FooterExternalLink>
            </ListItem>
          )}
          {tos && (
            <ListItem>
              <FooterExternalLink href={tos.href}>
                Terms of Use
              </FooterExternalLink>
            </ListItem>
          )}
          {about && (
            <ListItem>
              <FooterExternalLink href={about.href}>About</FooterExternalLink>
            </ListItem>
          )}
        </FooterList>
      </div>
      <div sx={{ flex: "0 0 auto", mt: 5, mr: [3, 5] }}>
        <H3 sx={{ mt: 0 }}>Patron Support</H3>
        <FooterList>
          {helpEmail && (
            <ListItem>
              <FooterExternalLink href={helpEmail.href}>
                Email Support
              </FooterExternalLink>
            </ListItem>
          )}
          {helpWebsite && (
            <ListItem>
              <FooterExternalLink href={helpWebsite.href}>
                Help Website
              </FooterExternalLink>
            </ListItem>
          )}
        </FooterList>
      </div>
      <div sx={{ flex: "1 1 0" }} />
      {NEXT_PUBLIC_COMPANION_APP === "simplye" && <DownloadSimplyECallout />}
    </footer>
  );
};

const DownloadSimplyECallout = () => (
  <div sx={{ maxWidth: 300, flex: "0 1 auto", mt: 5 }}>
    <H3 sx={{ mt: 0, display: "flex", alignItems: "center" }}>
      <SvgPhone sx={{ mr: 1 }} />
      Download SimplyE
    </H3>
    <Text>
      Our mobile app lets you browse, borrow and read from our whole collection
      of eBooks and Audiobooks right on your phone!
    </Text>
    <div sx={{ width: "75%", overflow: "hidden", ml: -3 }}>
      <IosBadge sx={{ p: 3, pb: 0 }} />
      <GooglePlayBadge />
    </div>
  </div>
);

const FooterList = (props: React.ComponentProps<typeof List>) => (
  <List
    sx={{
      "&>li": {
        my: 2
      }
    }}
    {...props}
  />
);

const FooterExternalLink: React.FC<React.HTMLProps<HTMLAnchorElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <ExternalLink sx={{ color: "ui.black" }} className={className} {...props}>
      {children}
    </ExternalLink>
  );
};

export default Footer;
