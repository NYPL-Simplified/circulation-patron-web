import * as React from "react";
import { mockShowAuthModal, render, setEnv } from "test-utils";
import WebpubViewer from "components/WebpubViewer";
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
  setEnv({
    NEXT_PUBLIC_AXIS_NOW_DECRYPT: true
  });

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
