import LoginWrapper from "auth/LoginWrapper";
import * as React from "react";
import { render } from "test-utils";
import { mockPush } from "test-utils/mockNextRouter";

test("renders header, subheader, and breadcrumbs", () => {
  const utils = render(<LoginWrapper />);
  expect(utils.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  expect(
    utils.getByRole("heading", { name: "XYZ Public Library" })
  ).toBeInTheDocument();
  expect(
    utils.getByRole("listitem", { name: "Current location: Login" })
  ).toBeInTheDocument();
  expect(
    utils.getByRole("link", { name: "XYZ Public Library" })
  ).toBeInTheDocument();
});

test("shows loading indicator when user state is loading", () => {
  const utils = render(<LoginWrapper>child</LoginWrapper>, {
    user: {
      isLoading: true
    }
  });
  expect(utils.getByText("Logging in...")).toBeInTheDocument();
  expect(utils.queryByText("child")).not.toBeInTheDocument();
});

test("shows children when not loading", () => {
  const utils = render(<LoginWrapper>child</LoginWrapper>);
  expect(utils.queryByText("Logging in...")).not.toBeInTheDocument();
  expect(utils.getByText("child")).toBeInTheDocument();
});

describe("redirects when user becomes authenticated", () => {
  test("uses nextUrl when present", async () => {
    render(<LoginWrapper />, {
      user: {
        isAuthenticated: true
      },
      router: {
        query: {
          nextUrl: "/book/somewhere"
        }
      }
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/book/somewhere", undefined, {
      shallow: true
    });
  });

  test("uses home page when no nextUrl", async () => {
    render(<LoginWrapper />, {
      user: {
        isAuthenticated: true
      }
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/testlib", undefined, {
      shallow: true
    });
  });

  test("does not redirect to login page (create infinite loop)", () => {
    render(<LoginWrapper />, {
      user: {
        isAuthenticated: true
      },
      router: {
        query: {
          nextUrl: "/test/login/somewhere"
        }
      }
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    // redirects to home page instead of nextUrl
    expect(mockPush).toHaveBeenCalledWith("/testlib", undefined, {
      shallow: true
    });
  });
});
