import * as React from "react";
import { render, setEnv } from "../../test-utils";
import WebpubViewer from "components/WebpubViewer";
import mockAuthenticatedOnce from "test-utils/mockAuthState";
import { PageNotFoundError } from "errors";

jest.mock("utils/reader", () => ({
  __esModule: true,
  default: jest.fn()
}));

test("throws error when url does not include bookUrl", () => {
  expect(() => render(<WebpubViewer />)).toThrowError(PageNotFoundError);
  expect(() => render(<WebpubViewer />)).toThrow(
    "The requested URL is missing a bookUrl parameter."
  );
});

test("shows fallback and auth modal if user is not logged in", () => {
  const utils = render(<WebpubViewer />, {
    router: { query: { bookUrl: "http://some-book.com" } }
  });
  expect(
    utils.getByText("You need to be logged in to view this page.")
  ).toBeInTheDocument();
  expect(
    utils.getByRole("button", { name: "Login with Library Barcode" })
  ).toBeInTheDocument();
});

test("renders viewer div", () => {
  mockAuthenticatedOnce();
  render(<WebpubViewer />, {
    router: { query: { bookUrl: "http://some-book.com" } }
  });

  expect(document.getElementById("viewer")).toBeInTheDocument();
});

test("fetches params with token if run with NEXT_PUBLIC_AXIS_NOW_DECRYPT", async () => {
  setEnv({
    NEXT_PUBLIC_AXIS_NOW_DECRYPT: true
  });
  mockAuthenticatedOnce();

  render(<WebpubViewer />, {
    router: { query: { bookUrl: "http://some-book.com" } }
  });
  // the wrapping UserProvider first calls the loans url
  expect(fetchMock).toHaveBeenCalledWith("/shelf-url", {
    headers: {
      Authorization: "some-token",
      "X-Requested-With": "XMLHttpRequest"
    }
  });
  // then we fetch the params
  expect(fetchMock).toHaveBeenCalledWith("http://some-book.com", {
    headers: {
      Authorization: "some-token",
      "X-Requested-With": "XMLHttpRequest"
    }
  });
});
