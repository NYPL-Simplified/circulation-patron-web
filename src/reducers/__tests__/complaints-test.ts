import { expect } from "chai";
import complaints from "../complaints";

describe("complaints reducer", () => {
  let initState = {
    isFetching: false,
    isPosting: false,
    types: [],
    error: null
  };

  let errorState = {
    isFetching: false,
    isPosting: false,
    types: [],
    error: "test error"
  };

  it("returns initial state for unrecognized action", () => {
    expect(complaints(undefined, {})).to.deep.equal(initState);
  });

  it("handles FETCH_COMPLAINT_TYPES_REQUEST", () => {
    let action = { type: "FETCH_COMPLAINT_TYPES_REQUEST", url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetching: true
    });
    expect(complaints(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      error: null
    });
    expect(complaints(errorState, action)).to.deep.equal(newState);
  });

  it("handles FETCH_COMPLAINT_TYPES_FAILURE", () => {
    let action = { type: "FETCH_COMPLAINT_TYPES_FAILURE", error: "test error" };
    let oldState = {
      isFetching: true,
      isPosting: false,
      types: [],
      error: null
    };
    let newState = Object.assign({}, oldState, {
      error: "test error",
      isFetching: false
    });
    expect(complaints(oldState, action)).to.deep.equal(newState);
  });

  it("handles LOAD_COMPLAINT_TYPES", () => {
    let action = { type: "LOAD_COMPLAINT_TYPES", types: ["type1", "type2"] };
    let newState = Object.assign({}, initState, {
      types: ["type1", "type2"]
    });
    expect(complaints(initState, action)).to.deep.equal(newState);
  });

  it("handles POST_COMPLAINT_REQUEST", () => {
    let action = { type: "POST_COMPLAINT_REQUEST", url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isPosting: true
    });
    expect(complaints(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isPosting: true,
      error: null
    });
    expect(complaints(errorState, action)).to.deep.equal(newState);
  });

  it("handles POST_COMPLAINT_FAILURE", () => {
    let action = { type: "POST_COMPLAINT_FAILURE", error: "test error" };
    let oldState = {
      isFetching: false,
      isPosting: true,
      types: [],
      error: null
    };
    let newState = Object.assign({}, oldState, {
      error: "test error",
      isPosting: false
    });
    expect(complaints(oldState, action)).to.deep.equal(newState);
  });
});
