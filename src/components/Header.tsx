import * as React from "react";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { HeaderProps } from "opds-web-client/lib/components/Root";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { LibraryData } from "../interfaces";
import * as PropTypes from "prop-types";

export interface HeaderContext extends NavigateContext {
  library: LibraryData;
}

export default class Header extends React.Component<HeaderProps, {}> {
  context: HeaderContext;

  static contextTypes = {
    library: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  render(): JSX.Element {
    return (
      <Navbar fluid={true} role="navigation">
        <Navbar.Header>
          <Navbar.Brand
            className={this.context.library.logoUrl ? "with-logo" : ""}
          >
            <span>{this.context.library.catalogName}</span>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>
          <Nav>
            {this.context.library.headerLinks &&
              this.context.library.headerLinks.map(link => (
                <li>
                  <a href={link.href} title={link.title}>
                    {link.title}
                  </a>
                </li>
              ))}
            <li>
              <CatalogLink
                collectionUrl={this.context.library.catalogUrl}
                bookUrl={null}
              >
                Catalog
              </CatalogLink>
            </li>
            {this.props.loansUrl && this.props.isSignedIn && (
              <li>
                <CatalogLink collectionUrl={this.props.loansUrl} bookUrl={null}>
                  My Books
                </CatalogLink>
              </li>
            )}
            {this.props.loansUrl && this.props.isSignedIn && (
              <li>
                <a role="button" onClick={this.signOut}>
                  Sign Out
                </a>
              </li>
            )}
            {this.props.loansUrl && !this.props.isSignedIn && (
              <li>
                <a role="button" onClick={this.signIn}>
                  Sign In
                </a>
              </li>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }

  signIn() {
    if (this.props.fetchLoans && this.props.loansUrl) {
      this.props.fetchLoans(this.props.loansUrl);
    }
  }

  signOut() {
    this.props.clearAuthCredentials();
    this.context.router.push(
      this.context.pathFor(this.context.library.catalogUrl, null)
    );
  }
}
