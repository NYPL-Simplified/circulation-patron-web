import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import BasicAuthButtonWithImage, {
  BasicAuthWithImageMethod
} from "../BasicAuthButtonWithImage";
import BasicAuthWithButtonImagePlugin from "../../BasicAuthWithButtonImagePlugin";

describe("BasicAuthButtonWithImage", () => {
  let wrapper;
  let provider;
  let onClick;

  beforeEach(() => {
    const method: BasicAuthWithImageMethod = {
      type: "method",
      description: "description",
      labels: { login: "login", password: "password" }
    };
    provider = { id: "method", method, plugin: BasicAuthWithButtonImagePlugin };
    onClick = stub();
    wrapper = shallow(
      <BasicAuthButtonWithImage provider={provider} onClick={onClick} />
    );
  });

  it("shows button with no image", () => {
    const button = wrapper.find("button");
    expect(button.length).to.equal(1);
    expect(button.text()).to.contain("Log in with description");
    expect(button.props()["aria-label"]).to.equal("Log in with description");
    const image = button.find("img");
    expect(image.length).to.equal(0);
  });

  it("shows button with image", () => {
    const method: BasicAuthWithImageMethod = {
      type: "method",
      description: "description",
      labels: { login: "login", password: "password" },
      links: [{ rel: "logo", href: "logo.png" }]
    };
    provider = { id: "method", method, plugin: BasicAuthWithButtonImagePlugin };

    wrapper = shallow(<BasicAuthButtonWithImage provider={provider} />);

    const button = wrapper.find("button");
    expect(button.length).to.equal(1);
    expect(button.props()["aria-label"]).to.equal("Log in with description");
    const image = button.find("img");
    expect(image.length).to.equal(1);
    expect(image.props().src).to.equal("logo.png");
    expect(image.props().alt).to.equal("Log in with description");
  });

  it("calls onClick", () => {
    const button = wrapper.find("button");
    button.simulate("click");
    expect(onClick.callCount).to.equal(1);
  });
});
