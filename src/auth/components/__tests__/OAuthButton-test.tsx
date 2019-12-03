import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import OAuthButton, { OAuthMethod } from "../OAuthButton";

describe("OAuthButton", () => {
  let wrapper;
  let provider;

  beforeEach(() => {
    const method = {
      type: "method",
      description: "description",
      links: [
        { rel: "authenticate", href: "auth" },
        { rel: "logo", href: "logo.png" }
      ]
    };
    provider = { method };

    wrapper = shallow(<OAuthButton provider={provider} />);
  });

  it("shows button with image", () => {
    const button = wrapper.find("a");
    expect(button.length).to.equal(1);
    expect(button.props()["aria-label"]).to.equal("Log in with description");
    const image = button.find("img");
    expect(image.length).to.equal(1);
    expect(image.props().src).to.equal("logo.png");
    expect(image.props().alt).to.equal("Log in with description");
  });

  it("links to authenticate with redirect", () => {
    const button = wrapper.find("a");
    expect(button.props().href).to.contain("auth&redirect_uri=");
  });

  it("doesn't show button if auth document is missing link", () => {
    let method: OAuthMethod = { type: "method" };
    provider = { method };

    wrapper = shallow(<OAuthButton provider={provider} />);
    let button = wrapper.find("a");
    expect(button.length).to.equal(0);

    method = { type: "method", links: [] };
    provider = { method };

    wrapper = shallow(<OAuthButton provider={provider} />);
    button = wrapper.find("a");
    expect(button.length).to.equal(0);
  });

  it("doesn't show image if auth document is missing link", () => {
    const method: OAuthMethod = {
      type: "method",
      links: [{ rel: "authenticate", href: "auth" }]
    };
    provider = { method };

    wrapper = shallow(<OAuthButton provider={provider} />);
    const button = wrapper.find("a");
    const image = button.find("img");
    expect(image.length).to.equal(0);
  });
});
