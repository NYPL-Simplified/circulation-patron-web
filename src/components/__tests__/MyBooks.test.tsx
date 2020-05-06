import * as React from "react";
import { render, fixtures, fireEvent } from "../../test-utils";
import { MyBooks } from "../MyBooks";
import { AuthCredentials } from "opds-web-client/lib/interfaces";
import merge from "deepmerge";
import { State } from "opds-web-client/lib/state";
import Layout from "../Layout";
import userEvent from "@testing-library/user-event";
import { useBreakpointIndex } from "@theme-ui/match-media";
import { mockPush } from "../../test-utils/mockNextRouter";

const mockSetCollectionAndBook = jest.fn().mockReturnValue(Promise.resolve({}));

test("shows message and button when not authenticated", () => {
  const node = render(
    <MyBooks setCollectionAndBook={mockSetCollectionAndBook} />
  );

  expect(
    node.getByText("You need to be signed in to view this page.")
  ).toBeInTheDocument();
});

const authCredentials: AuthCredentials = {
  provider: "auth-provider",
  credentials: "auth-credentials"
};

const emptyWithAuth: State = merge(fixtures.initialState, {
  auth: {
    credentials: authCredentials
  }
});

test("displays empty state when empty and signed in", () => {
  const node = render(
    <MyBooks setCollectionAndBook={mockSetCollectionAndBook} />,
    { initialState: emptyWithAuth }
  );

  expect(
    node.queryByText("You need to be signed in to view this page.")
  ).toBeFalsy();

  expect(
    node.getByText(
      "Your books will show up here when you have any loaned or on hold."
    )
  ).toBeInTheDocument();

  expect(node.getByText("Sign Out")).toBeInTheDocument();
});

test("sign out clears state and goes home", () => {
  const node = render(
    <MyBooks setCollectionAndBook={mockSetCollectionAndBook} />,
    { initialState: emptyWithAuth }
  );

  const signOut = node.getByText("Sign Out");
  fireEvent.click(signOut);

  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith("/", undefined);

  expect(node.store.getState().auth.credentials).toBeFalsy();
  /**
   * even though the location shows home, we should still be able to assert on the MyBooks
   * because we are rendering it no matter what route we are on
   */
  expect(
    node.getByText("You need to be signed in to view this page.")
  ).toBeInTheDocument();
});

const withAuthAndBooks: State = merge(fixtures.initialState, {
  auth: {
    credentials: authCredentials
  },
  collection: {
    data: {
      books: fixtures.makeBooks(10)
    }
  }
});

test("displays books when signed in with data", () => {
  const node = render(
    <MyBooks setCollectionAndBook={mockSetCollectionAndBook} />,
    { initialState: withAuthAndBooks }
  );

  expect(
    node.queryByText("You need to be signed in to view this page.")
  ).toBeFalsy();

  expect(
    node.queryByText(
      "Your books will show up here when you have any loaned or on hold."
    )
  ).toBeFalsy();

  expect(node.getByText(fixtures.makeBook(0).title)).toBeInTheDocument();
  expect(node.getByText(fixtures.makeBook(9).title)).toBeInTheDocument();

  expect(
    node.getByText(fixtures.makeBook(0).authors.join(", "))
  ).toBeInTheDocument();
});

test("sets collection and book", () => {
  render(<MyBooks setCollectionAndBook={mockSetCollectionAndBook} />, {
    initialState: withAuthAndBooks
  });

  expect(mockSetCollectionAndBook).toHaveBeenCalledTimes(1);
  expect(mockSetCollectionAndBook).toHaveBeenCalledWith(
    "http://simplye-dev-cm.amigos.org/xyzlib/loans",
    undefined
  );
});

/**
 * - toggles between list and gallery view
 * - shows the reserved button
 */

const loading: State = merge(fixtures.initialState, {
  auth: {
    credentials: authCredentials
  },
  collection: {
    isFetching: true
  }
});

test("shows loading state", () => {
  const node = render(
    <MyBooks setCollectionAndBook={mockSetCollectionAndBook} />,
    {
      initialState: loading
    }
  );

  expect(node.getByText("Loading...")).toBeInTheDocument();
});

jest.mock("@theme-ui/match-media");
const mockeduseBreakpointsIndex = useBreakpointIndex as jest.MockedFunction<
  typeof useBreakpointIndex
>;
mockeduseBreakpointsIndex.mockReturnValue(1);

test("toggles between list and gallery view", () => {
  const node = render(
    <Layout>
      <MyBooks setCollectionAndBook={mockSetCollectionAndBook} />
    </Layout>,
    { initialState: withAuthAndBooks }
  );

  const galleryRadio = node.getByLabelText("Gallery View");
  const listRadio = node.getByLabelText("List View");
  expect(galleryRadio).toHaveAttribute("aria-checked", "true");

  userEvent.click(listRadio);

  expect(listRadio).toHaveAttribute("aria-checked", "true");
});
