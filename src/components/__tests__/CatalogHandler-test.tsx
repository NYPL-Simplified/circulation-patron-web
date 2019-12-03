import * as React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import * as tinycolor from "tinycolor2";

import CatalogHandler from "../CatalogHandler";
import OPDSCatalog from "opds-web-client/lib/components/OPDSCatalog";
import buildStore from "opds-web-client/lib/store";
import UrlShortener from "../../UrlShortener";

describe("CatalogHandler", () => {
  let wrapper;
  let store;
  let params;
  let context;
  let child;
  let name = "Example";

  beforeEach(() => {
    store = buildStore();
    params = {
      collectionUrl: "collectionurl",
      bookUrl: "library/bookurl",
      tab: "tab"
    };
    context = {
      library: {
        id: "uuid",
        catalogUrl: "http://example.com/home",
        catalogName: name,
        logoUrl: "http://example.com/logo"
      },
      urlShortener: new UrlShortener("http://example.com/home", false),
      initialState: store.getState()
    };
  });

  it("renders OPDSCatalog", () => {
    wrapper = shallow(<CatalogHandler params={params} />, { context });

    let catalog = wrapper.find(OPDSCatalog);
    expect(catalog.prop("collectionUrl")).to.equal("collectionurl");
    expect(catalog.prop("bookUrl")).to.equal("library/bookurl");
    expect(catalog.prop("Header").name).to.equal("Header");
    expect(catalog.prop("Footer").name).to.equal("Footer");
    expect(catalog.prop("BookDetailsContainer").name).to.equal(
      "BookDetailsContainer"
    );
    expect(catalog.prop("initialState")).to.equal(store.getState());
    expect(catalog.prop("computeBreadcrumbs")).to.be.ok;
    let pageTitleTemplate = catalog.prop("pageTitleTemplate");
    expect(pageTitleTemplate("Collection", "Book")).to.equal("Example - Book");
    expect(pageTitleTemplate("Collection", null)).to.equal(
      "Example - Collection"
    );
  });

  it("renders div with CSS variables", () => {
    let div = wrapper.find("div");
    let cssVariables = div.prop("style");
    expect(cssVariables["--logo"]).to.equal("url('http://example.com/logo')");

    // Since we haven't defined colors in the context, they're defaults.

    expect(cssVariables["--pagecolor"]).to.equal("#ffffff");
    expect(cssVariables["--pagecolorlight"]).to.equal("#fafafa");
    expect(cssVariables["--footercolor"]).to.equal("#fafafa");
    expect(cssVariables["--transparentpagecolor"]).to.equal(
      "rgba(255, 255, 255, 0.5)"
    );
    expect(cssVariables["--semitransparentpagecolor"]).to.equal(
      "rgba(255, 255, 255, 0.9)"
    );

    expect(cssVariables["--linkcolor"]).to.equal("#000000");
    expect(cssVariables["--linkvisitedcolor"]).to.equal("#333333");
    expect(cssVariables["--linkhovercolor"]).to.equal("#1a1a1a");
    expect(cssVariables["--pagetextcolor"]).to.equal("#000000");
    expect(cssVariables["--pagetextcolorlight"]).to.equal("#000000");
    expect(cssVariables["--highlightcolor"]).to.equal("#000000");

    let library = {
      ...context.library,
      colors: { background: "#000000", foreground: "#ffffff" }
    };
    wrapper.setContext({ ...context, library });
    div = wrapper.find("div");
    cssVariables = div.prop("style");

    expect(cssVariables["--pagecolor"]).to.equal("#000000");
    expect(cssVariables["--pagecolorlight"]).to.equal("#050505");
    expect(cssVariables["--footercolor"]).to.equal("#050505");
    expect(cssVariables["--transparentpagecolor"]).to.equal(
      "rgba(0, 0, 0, 0.5)"
    );
    expect(cssVariables["--semitransparentpagecolor"]).to.equal(
      "rgba(0, 0, 0, 0.9)"
    );

    expect(cssVariables["--linkcolor"]).to.equal("#ffffff");
    expect(cssVariables["--linkvisitedcolor"]).to.equal("#cccccc");
    expect(cssVariables["--linkhovercolor"]).to.equal("#e6e6e6");
    expect(cssVariables["--pagetextcolor"]).to.equal("#ffffff");
    expect(cssVariables["--pagetextcolorlight"]).to.equal("#ffffff");
    expect(cssVariables["--highlightcolor"]).to.equal("#ffffff");
  });
});
