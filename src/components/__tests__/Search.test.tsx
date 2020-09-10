import * as React from "react";
import { render, fixtures, fireEvent, actions } from "../../test-utils";
import Search from "../Search";
import merge from "deepmerge";
import userEvent from "@testing-library/user-event";
import { mockPush } from "../../test-utils/mockNextRouter";

test("fetches search description", async () => {
  const mockedFetchSearchDescription = jest.spyOn(
    actions,
    "fetchSearchDescription"
  );
  const utils = render(<Search />, {
    initialState: merge(fixtures.initialState, {
      collection: {
        data: {
          search: {
            url: "/search-url"
          }
        }
      }
    })
  });

  expect(mockedFetchSearchDescription).toHaveBeenCalledTimes(1);
  expect(mockedFetchSearchDescription).toHaveBeenCalledWith("/search-url");
  expect(utils.dispatch).toHaveBeenCalledTimes(1);
});

test("doesn't render if there is no searchData in the store", () => {
  const utils = render(<Search />, {
    initialState: merge(fixtures.initialState, {
      collection: {
        data: {
          search: undefined
        }
      }
    })
  });
  expect(utils.container).toBeEmptyDOMElement();
});

test("searching calls history.push with url", async () => {
  const mockedTemplate = jest.fn().mockReturnValue("templatereturn");
  const utils = render(<Search />, {
    initialState: merge(fixtures.initialState, {
      collection: {
        data: {
          search: {
            url: "/search-url",
            searchData: {
              template: mockedTemplate
            }
          }
        }
      }
    })
  });
  const searchButton = utils.getByText("Search");
  const input = utils.getByLabelText("Enter search keyword or keywords");
  // act
  userEvent.type(input, "my search");
  fireEvent.click(searchButton);

  // assert
  expect(mockedTemplate).toHaveBeenCalledTimes(1);
  expect(mockedTemplate).toHaveBeenCalledWith("my%20search");
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith(
    "/collection/[collectionUrl]",
    "/collection/templatereturn"
  );
});
