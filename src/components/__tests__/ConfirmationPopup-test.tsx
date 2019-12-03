import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import ConfirmationPopup from "../ConfirmationPopup";

describe("ConfirmationPopup", () => {
  let wrapper;
  let confirm;
  let cancel;

  beforeEach(() => {
    confirm = stub();
    cancel = stub();
    wrapper = shallow(
      <ConfirmationPopup
        confirm={confirm}
        cancel={cancel}
        text="are you sure"
        confirmText="confirm"
        cancelText="cancel"
      />
    );
  });

  it("shows popup", () => {
    let popup = wrapper.find(".confirmation-popup");
    expect(popup.text()).to.contain("are you sure");
    let confirmButton = wrapper.find(".confirm-button");
    let cancelButton = wrapper.find(".cancel-button");
    expect(confirmButton.text()).to.equal("confirm");
    expect(cancelButton.text()).to.equal("cancel");
  });

  it("calls confirm", () => {
    let confirmButton = wrapper.find(".confirm-button");
    confirmButton.simulate("click");
    expect(confirm.callCount).to.equal(1);
  });

  it("calls cancel", () => {
    let cancelButton = wrapper.find(".cancel-button");
    cancelButton.simulate("click");
    expect(cancel.callCount).to.equal(1);
  });
});
