import * as React from "react";
import { mockShowAuthModal, render } from "test-utils";
import WebpubViewer from "components/WebpubViewer";
import { PageNotFoundError } from "errors";
import * as env from "utils/env";

jest.mock("utils/reader", () => ({
  __esModule: true,
  default: jest.fn()
}));

// mock fetch to avoid console errors
fetchMock.mockResponse(JSON.stringify({ some: "response" }));

test("throws error when url does not include bookUrl", () => {
  // suppress console warning about error because they're expected for this test
  jest.spyOn(console, "error").mockImplementation(jest.fn);
  expect(() => render(<WebpubViewer />)).toThrowError(PageNotFoundError);
  expect(() => render(<WebpubViewer />)).toThrow(
    "The requested URL is missing a bookUrl parameter."
  );
});

test("shows fallback and auth modal if user is not logged in", () => {
  expect(mockShowAuthModal).toHaveBeenCalledTimes(0);
  const utils = render(<WebpubViewer />, {
    router: { query: { bookUrl: "http://some-book.com" } },
    user: { isAuthenticated: false, token: undefined }
  });
  expect(
    utils.getByText("You need to be logged in to view this page.")
  ).toBeInTheDocument();

  expect(mockShowAuthModal).toHaveBeenCalledTimes(1);
});

test("renders viewer div", () => {
  render(<WebpubViewer />, {
    router: { query: { bookUrl: "http://some-book.com" } }
  });

  expect(document.getElementById("viewer")).toBeInTheDocument();
});

test("fetches params with token if run with NEXT_PUBLIC_AXIS_NOW_DECRYPT", async () => {
  (env as any).AXISNOW_DECRYPT = "true";
  render(<WebpubViewer />, {
    router: { query: { bookUrl: "http://some-book.com" } }
  });
  // then we fetch the params
  expect(fetchMock).toHaveBeenCalledWith("http://some-book.com", {
    headers: {
      Authorization: "user-token",
      "X-Requested-With": "XMLHttpRequest"
    }
  });
});
