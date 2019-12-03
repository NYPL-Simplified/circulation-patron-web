import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import ReportProblemLink from "../ReportProblemLink";
import ReportProblemForm from "../ReportProblemForm";

describe("ReportProblemLink", () => {
  let wrapper;
  let report = stub();
  let fetchTypes = stub();
  let types = ["type1", "type2", "type3"];

  beforeEach(() => {
    wrapper = shallow(
      <ReportProblemLink
        reportUrl="reportUrl"
        report={report}
        fetchTypes={fetchTypes}
        types={types}
      />
    );
  });

  it("shows link", () => {
    let link = wrapper.find("a");
    expect(link.text()).to.equal("Report a Problem");
    expect(link.props().onClick).to.equal(wrapper.instance().openForm);
  });

  it("shows form when link is clicked", () => {
    let link = wrapper.find("a");
    link.simulate("click");
    let form = wrapper.find(ReportProblemForm);
    expect(form.props().types).to.equal(types);
    expect(form.props().report).to.equal(report);
    expect(form.props().fetchTypes).to.equal(fetchTypes);
    expect(form.props().close).to.equal(wrapper.instance().closeForm);
  });

  it("hides form", () => {
    wrapper.instance().closeForm();
    let form = wrapper.find(ReportProblemForm);
    expect(form.length).to.equal(0);
  });
});
