import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import Footer from "../Footer";

describe("Footer", () => {
  let wrapper;
  const collection = {
    id: "collection",
    title: "Collection",
    url: "Collection",
    lanes: [],
    books: [],
    navigationLinks: [],
    links: [
      { url: "about", type: "about", text: "abcd" },
      { url: "terms", type: "terms-of-service", text: null },
      { url: "unknown", type: "unknown", text: null }
    ]
  };

  beforeEach(() => {
    wrapper = shallow(<Footer collection={collection} />);
  });

  describe("rendering", () => {
    it("displays links", () => {
      const links = wrapper.find("a");
      expect(links.length).to.equal(2);
      const aboutLink = links.at(0);
      const termsLink = links.at(1);
      expect(aboutLink.props().href).to.equal("about");
      expect(termsLink.props().href).to.equal("terms");
      expect(aboutLink.text()).to.equal("About");
      expect(termsLink.text()).to.equal("Terms of Service");
    });
  });
});
