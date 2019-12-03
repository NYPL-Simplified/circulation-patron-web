import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import RevokeButton from "../RevokeButton";
import ConfirmationPopup from "../ConfirmationPopup";

describe("RevokeButton", () => {
  let wrapper;
  let revoke = stub();

  beforeEach(() => {
    wrapper = shallow(<RevokeButton revoke={revoke}>Revoke</RevokeButton>);
  });

  it("shows button", () => {
    let button = wrapper.find("button");
    expect(button.text()).to.equal("Revoke");
    expect(button.props().onClick).to.equal(
      wrapper.instance().showConfirmationPopup
    );
  });

  it("shows popup when button is clicked", () => {
    let button = wrapper.find("button");
    button.simulate("click");
    let popup = wrapper.find(ConfirmationPopup);
    expect(popup.props().confirm).to.equal(wrapper.instance().revoke);
    expect(popup.props().cancel).to.equal(
      wrapper.instance().hideConfirmationPopup
    );
    expect(popup.props().text).to.contain("return");
  });

  it("shows and hides popup", () => {
    wrapper.instance().showConfirmationPopup();
    wrapper.update();
    let popup = wrapper.find(ConfirmationPopup);
    expect(popup.length).to.equal(1);

    wrapper.instance().hideConfirmationPopup();
    wrapper.update();
    popup = wrapper.find(ConfirmationPopup);
    expect(popup.length).to.equal(0);
  });
});
