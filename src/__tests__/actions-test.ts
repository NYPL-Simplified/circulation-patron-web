import { expect } from "chai";
import { stub } from "sinon";

import * as actions from "../actions";
const fetchMock = require("fetch-mock");

let fetchResponse = null;

describe("fetchComplaintTypes", () => {
  afterEach(() => {
    fetchMock.restore();
  });

  const reportUrl = "http://example.com/report";

  it("dispatches request, load, and success", async () => {
    const dispatch = stub();
    fetchResponse = "type1\ntype2\ntype3";
    fetchMock.mock(reportUrl, fetchResponse);

    const types = await actions.fetchComplaintTypes(reportUrl)(dispatch);

    expect(dispatch.callCount).to.equal(3);
    expect(dispatch.args[0][0].type).to.equal(
      actions.FETCH_COMPLAINT_TYPES_REQUEST
    );
    expect(dispatch.args[1][0].type).to.equal(
      actions.FETCH_COMPLAINT_TYPES_SUCCESS
    );
    expect(dispatch.args[2][0].type).to.equal(actions.LOAD_COMPLAINT_TYPES);
    expect(types).to.deep.equal(["type1", "type2", "type3"]);
  });

  it("dispatches failure", async () => {
    const dispatch = stub();
    fetchMock.mock(reportUrl, Promise.reject({ message: "test error" }));

    try {
      await actions.fetchComplaintTypes(reportUrl)(dispatch);
      // Should not get here
      expect(false).to.equal(true);
    } catch (err) {
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(
        actions.FETCH_COMPLAINT_TYPES_REQUEST
      );
      expect(dispatch.args[1][0].type).to.equal(
        actions.FETCH_COMPLAINT_TYPES_FAILURE
      );
      expect(err).to.deep.equal({ message: "test error" });
    }
  });

  describe("postComplaint", () => {
    const reportUrl = "http://example.com/report";
    const data = {
      type: "bad-description",
      detail: "i would love it if this description were written as a sonnet"
    };

    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      fetchResponse = null;
      fetchMock.mock(reportUrl, { status: 200, body: fetchResponse });

      const types = await actions.postComplaint(reportUrl, data)(dispatch);

      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(actions.POST_COMPLAINT_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(actions.POST_COMPLAINT_SUCCESS);
      expect(types).to.equal(undefined);
    });

    it("dispatches failure", async () => {
      const dispatch = stub();
      fetchMock.mock(reportUrl, Promise.reject({ message: "test error" }));

      try {
        await actions.postComplaint(reportUrl, data)(dispatch);
        // Should not get here
        expect(false).to.equal(true);
      } catch (err) {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(
          actions.POST_COMPLAINT_REQUEST
        );
        expect(dispatch.args[1][0].type).to.equal(
          actions.POST_COMPLAINT_FAILURE
        );
        expect(err).to.deep.equal({ message: "test error" });
      }
    });
  });
});
