import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import ReportProblemForm from "../ReportProblemForm";

describe("ReportProblemForm", () => {
  let wrapper;
  let report;
  let fetchTypes;
  let close;
  let types;

  beforeEach(() => {
    types = ["problem-type1", "problem-type2", "problem-type3"];
    report = stub().returns(Promise.resolve());
    fetchTypes = stub().returns(Promise.resolve(types));
    close = stub();
    wrapper = mount(
      <ReportProblemForm
        reportUrl="report url"
        report={report}
        fetchTypes={fetchTypes}
        close={close}
        types={types}
      />
    );
  });

  describe("rendering", () => {
    it("displays title", () => {
      const title = wrapper.find("h3");
      expect(title.text()).to.equal("Report a Problem");
    });

    it("displays type dropdown", () => {
      const options = wrapper.find("select").find("option");
      const values = options.map(option => option.props().value);
      const names = options.map(option => option.text());
      expect(values).to.deep.equal([""].concat(types));
      expect(names).to.deep.equal(
        ["choose a type"].concat(
          types.map(type => wrapper.instance().displayType(type))
        )
      );
    });

    it("displays details input", () => {
      const details = wrapper.find("textarea");
      expect(details.props().placeholder).to.equal("details");
    });

    it("displays submit button", () => {
      const button = wrapper
        .find("button")
        .filterWhere(button => button.text() === "Submit");
      expect(button.props().onClick).to.equal(wrapper.instance().submit);
    });

    it("displays cancel button", () => {
      const button = wrapper
        .find("button")
        .filterWhere(button => button.text() === "Cancel");
      expect(button.props().onClick).to.equal(close);
    });
  });

  describe("behavior", () => {
    it("fetches types on mount", () => {
      expect(fetchTypes.callCount).to.equal(1);
      expect(fetchTypes.args[0][0]).to.equal("report url");
    });

    it("displays error if submitted without type", () => {
      const button = wrapper
        .find("button")
        .filterWhere(button => button.text() === "Submit");
      button.simulate("click");
      const error = wrapper.find(".error");
      expect(error.text()).to.equal("You must select a type");
    });

    it("submits", () => {
      wrapper.instance().refs = {
        type: { value: "bad-description" },
        detail: { value: "what an imperfect description!" }
      };
      const button = wrapper
        .find("button")
        .filterWhere(button => button.text() === "Submit");
      button.simulate("click");
      expect(report.callCount).to.equal(1);
      expect(report.args[0][0]).to.equal("report url");
      expect(report.args[0][1]).to.deep.equal({
        type: "bad-description",
        detail: "what an imperfect description!"
      });
    });

    it("displays result and close button after submitting", async () => {
      wrapper.instance().refs = {
        type: { value: "bad-description" },
        detail: { value: "what an imperfect description!" }
      };
      await wrapper.instance().submit();

      const title = wrapper.find("h3");
      expect(title.text()).to.equal("Problem Reported");
      const closeButton = wrapper.find("button").at(1);
      expect(closeButton.props().onClick).to.equal(close);
    });

    it("closes", () => {
      wrapper.setState({ submitted: true });
      const closeButton = wrapper
        .find("button")
        .filterWhere(button => button.text() === "Close");
      closeButton.simulate("click");
      expect(close.callCount).to.equal(1);
    });
  });
});
