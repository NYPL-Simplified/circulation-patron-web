import * as React from "react";
import { render, fixtures, fireEvent } from "test-utils";
import Search from "../Search";
import userEvent from "@testing-library/user-event";
import { mockPush } from "test-utils/mockNextRouter";

test("doesn't render if there is no searchData in the library context", () => {
  const utils = render(<Search />, {
    library: {
      ...fixtures.libraryData,
      searchData: null
    }
  });
  expect(utils.container).toBeEmptyDOMElement();
});

test("searching calls history.push with url", async () => {
  const utils = render(<Search />, {
    library: {
      ...fixtures.libraryData,
      searchData: {
        template: "/search/{searchTerms}",
        description: "search desc",
        shortName: "search shortname",
        url: "http://search-url"
      }
    }
  });
  const searchButton = utils.getByText("Search");
  const input = utils.getByLabelText("Enter search keyword or keywords");
  // act
  userEvent.type(input, "my search");
  fireEvent.click(searchButton);

  // assert
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith(
    "/testlib/collection/http%3A%2F%2Fsearch-url%2Fsearch%2Fmy%2520search"
  );
});
