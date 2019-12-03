import * as React from "react";
import * as ReactDOM from "react-dom";
import * as tinycolor from "tinycolor2";
import { State } from "opds-web-client/lib/state";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { Router, Route, browserHistory } from "react-router";
const OPDSCatalog = require("opds-web-client");
import Header from "./Header";
import Footer from "./Footer";
import BookDetailsContainer from "./BookDetailsContainer";
import { NavigateContext } from "opds-web-client/lib/interfaces";
import computeBreadcrumbs from "../computeBreadcrumbs";
import UrlShortener from "../UrlShortener";
import { LibraryData } from "../interfaces";
import BasicAuthWithButtonImagePlugin from "../auth/BasicAuthWithButtonImagePlugin";
import OAuthPlugin from "../auth/OAuthPlugin";
import * as PropTypes from "prop-types";

export interface CatalogHandlerProps extends React.Props<CatalogHandler> {
  params: {
    library: string;
    collectionUrl: string;
    bookUrl: string;
    tab: string;
  };
}

export interface CatalogHandlerContext {
  library: LibraryData;
  urlShortener: UrlShortener;
  initialState?: State;
}

export default class CatalogHandler extends React.Component<
  CatalogHandlerProps,
  any
> {
  context: CatalogHandlerContext;

  static contextTypes: React.ValidationMap<CatalogHandlerContext> = {
    library: PropTypes.object.isRequired,
    urlShortener: PropTypes.object.isRequired,
    initialState: PropTypes.object
  };

  render() {
    let { collectionUrl, bookUrl } = this.props.params;

    let pageTitleTemplate = (collectionTitle, bookTitle) => {
      let details = bookTitle || collectionTitle;
      return (
        this.context.library.catalogName + (details ? " - " + details : "")
      );
    };

    collectionUrl =
      this.context.urlShortener.expandCollectionUrl(collectionUrl) || null;
    bookUrl = this.context.urlShortener.expandBookUrl(bookUrl) || null;

    let cssVariables = {};
    if (this.context.library.logoUrl) {
      cssVariables["--logo"] = `url('${this.context.library.logoUrl}')`;
    }
    let background = tinycolor(
      (this.context.library.colors && this.context.library.colors.background) ||
        "#ffffff"
    );
    let foreground = tinycolor(
      (this.context.library.colors && this.context.library.colors.foreground) ||
        "#000000"
    );

    cssVariables["--pagecolor"] = background.toString();
    if (background.isLight()) {
      cssVariables["--pagecolorlight"] = background
        .clone()
        .darken(2)
        .toString();
      cssVariables["--footercolor"] = background
        .clone()
        .darken(2)
        .toString();
    } else {
      cssVariables["--pagecolorlight"] = background
        .clone()
        .lighten(2)
        .toString();
      cssVariables["--footercolor"] = background
        .clone()
        .lighten(2)
        .toString();
    }
    background.setAlpha(0.5);
    cssVariables["--transparentpagecolor"] = background.toString();
    background.setAlpha(0.9);
    cssVariables["--semitransparentpagecolor"] = background.toString();

    cssVariables["--linkcolor"] = foreground.toString();
    if (foreground.isDark()) {
      cssVariables["--linkvisitedcolor"] = foreground
        .clone()
        .lighten(20)
        .toString();
      cssVariables["--linkhovercolor"] = foreground
        .clone()
        .lighten(10)
        .toString();
      cssVariables["--pagetextcolor"] = foreground
        .clone()
        .desaturate(10)
        .toString();
      cssVariables["--pagetextcolorlight"] = foreground
        .clone()
        .desaturate(10)
        .darken(25)
        .toString();
      cssVariables["--highlightcolor"] = foreground
        .clone()
        .desaturate(10)
        .toString();
    } else {
      cssVariables["--linkvisitedcolor"] = foreground
        .clone()
        .darken(20)
        .toString();
      cssVariables["--linkhovercolor"] = foreground
        .clone()
        .darken(10)
        .toString();
      cssVariables["--pagetextcolor"] = foreground
        .clone()
        .desaturate(10)
        .toString();
      cssVariables["--pagetextcolorlight"] = foreground
        .clone()
        .desaturate(10)
        .lighten(25)
        .toString();
      cssVariables["--highlightcolor"] = foreground
        .clone()
        .desaturate(10)
        .toString();
    }

    return (
      <div style={cssVariables}>
        <OPDSCatalog
          collectionUrl={collectionUrl}
          bookUrl={bookUrl}
          Header={Header}
          Footer={Footer}
          BookDetailsContainer={BookDetailsContainer}
          pageTitleTemplate={pageTitleTemplate}
          computeBreadcrumbs={computeBreadcrumbs}
          initialState={this.context.initialState}
          authPlugins={[BasicAuthWithButtonImagePlugin, OAuthPlugin]}
        />
      </div>
    );
  }
}
