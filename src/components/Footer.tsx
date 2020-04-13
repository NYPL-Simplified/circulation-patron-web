/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import ExternalLink from "./ExternalLink";
import useLibraryContext from "./context/LibraryContext";

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
      sx={{ backgroundColor: "primaries.dark", color: "white" }}
      className={className}
    >
      <div
        sx={{ display: "flex", alignItems: "flex-start", letterSpacing: 0.9 }}
      >
        <div sx={{ m: 4 }}>
          <Styled.h5 sx={{ m: 0 }}>{title}</Styled.h5>
          <Styled.ul>
            <Styled.li>
              {libraryWebsite && (
                <FooterExternalLink href={libraryWebsite.href}>
                  Library Website
                </FooterExternalLink>
              )}
            </Styled.li>
            <Styled.li>
              {registration && (
                <FooterExternalLink href={registration.href}>
                  Patron Registration
                </FooterExternalLink>
              )}
            </Styled.li>
          </Styled.ul>
        </div>
        <div sx={{ m: 4, mb: 2 }}>
          <Styled.h5 sx={{ m: 0 }}>Patron Support</Styled.h5>
          <Styled.ul>
            {helpEmail && (
              <Styled.li>
                <FooterExternalLink href={helpEmail.href}>
                  Email Support
                </FooterExternalLink>
              </Styled.li>
            )}
            {helpWebsite && (
              <Styled.li>
                <FooterExternalLink href={helpWebsite.href}>
                  Help Website
                </FooterExternalLink>
              </Styled.li>
            )}
          </Styled.ul>
        </div>
      </div>
      <div sx={{ mx: 4, my: 2, fontSize: 1 }}>
        {/* <span sx={{ mr: 2 }}>Copyright</span> */}
        <Styled.ul sx={{ display: "inline-flex", "&>li": { mx: 2 } }}>
          {privacyPolicy && (
            <Styled.li>
              <FooterExternalLink href={privacyPolicy.href}>
                Privacy
              </FooterExternalLink>
            </Styled.li>
          )}
          {tos && (
            <Styled.li>
              <FooterExternalLink href={tos.href}>
                Terms of Use
              </FooterExternalLink>
            </Styled.li>
          )}
          {about && (
            <Styled.li>
              <FooterExternalLink href={about.href}>About</FooterExternalLink>
            </Styled.li>
          )}
        </Styled.ul>
      </div>
    </footer>
  );
};

const FooterExternalLink: React.FC<React.HTMLProps<HTMLAnchorElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <ExternalLink
      sx={{ color: "primaries.medium", textDecoration: "none", fontSize: 1 }}
      className={className}
      {...props}
    >
      {children}
    </ExternalLink>
  );
};

export default Footer;
