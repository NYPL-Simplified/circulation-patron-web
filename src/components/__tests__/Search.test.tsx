import * as React from "react";
import { render, fixtures, fireEvent } from "test-utils";
import Search from "../Search";
import userEvent from "@testing-library/user-event";
import { mockPush } from "test-utils/mockNextRouter";
import useSWR from "swr";
import { makeSwrResponse, MockSwr } from "test-utils/mockSwr";
import { SearchData } from "interfaces";

const fixtureData = {
  template: "/search/{searchTerms}",
  description: "search desc",
  shortName: "search shortname",
  url: "http://search-url.com/"
};

jest.mock("swr");

const mockedSWR = useSWR as jest.MockedFunction<typeof useSWR>;

const mockSwr: MockSwr<SearchData> = (
  value = makeSwrResponse({ data: fixtureData })
) => {
  mockedSWR.mockImplementation(key => {
    if (key?.[0] === "/collection")
      return makeSwrResponse({ data: fixtures.emptyCollection });
    return makeSwrResponse(value);
  });
};

test("doesn't render if there is no searchData set", () => {
  mockSwr({ data: undefined });
  const utils = render(<Search />, {
    router: {
      query: { collectionUrl: "/collection" }
    }
  });
  expect(utils.container).toBeEmptyDOMElement();
});

test("fetches search description", async () => {
  mockSwr({ data: fixtureData });
  render(<Search />, {
    router: {
      query: { collectionUrl: "/collection" }
    }
  });
  expect(mockedSWR).toHaveBeenCalledWith(
    ["/collection", "user-token"],
    expect.anything()
  );
  expect(mockedSWR).toHaveBeenCalledWith("/search-data-url", expect.anything());
});

test("searching calls history.push with url", async () => {
  mockSwr();
  const utils = render(<Search />, {
    router: {
      query: { collectionUrl: "/collection" }
    }
  });
  const searchButton = utils.getByText("Search");
  const input = utils.getByLabelText("Enter search keyword or keywords");
  // act
  userEvent.type(input, "my search");
  fireEvent.click(searchButton);

  // assert
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(
    mockPush
  ).toHaveBeenCalledWith(
    "/testlib/collection/http%3A%2F%2Fsearch-url.com%2Fsearch%2Fmy%2520search",
    undefined,
    { shallow: true }
  );
});
