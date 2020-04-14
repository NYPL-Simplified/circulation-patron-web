import * as React from "react";
import { render, fixtures, actions, wait } from "../../../test-utils";
import merge from "deepmerge";
import { BookDetails } from "../index";
import { State } from "opds-web-client/lib/state";
import { BookData, CollectionData } from "opds-web-client/lib/interfaces";
import * as complaintActions from "../../../hooks/useComplaints/actions";
import { RecommendationsStateContext } from "../../context/RecommendationsContext";
import userEvent from "@testing-library/user-event";
import ReportProblem from "../ReportProblem";

const mockSetCollectionAndBook = jest.fn().mockResolvedValue({});

/**
 * We need to mock actions.fetchCollection so that
 * ReportProblem doesn't actually fetch anything
 */
jest
  .spyOn(actions, "fetchCollection")
  .mockImplementation(() => () => Promise.resolve({} as CollectionData));

const makeStateWithBook = (book: BookData = fixtures.book): State =>
  merge<State>(fixtures.initialState, {
    book: {
      isFetching: false,
      url: "/book",
      error: null,
      data: book
    }
  });

test("shows loading state", () => {
  const node = render(
    <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
    {
      initialState: merge<State>(fixtures.initialState, {
        book: {
          isFetching: true,
          url: "/book",
          error: null,
          data: null
        }
      })
    }
  );
  expect(node.getByText("Loading...")).toBeInTheDocument();
});

test("handles error state", () => {
  const node = render(
    <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
    {
      initialState: merge<State>(fixtures.initialState, {
        book: {
          isFetching: false,
          url: "/book",
          error: {
            response: "Some error",
            status: 401,
            url: "/book-error-url"
          },
          data: null
        }
      })
    }
  );
  /**
   * We will snapshot test this component because it isn't complicated and should prettymuch remain the same.
   */
  expect(node.container).toMatchSnapshot();
});

test("shows categories", () => {
  const node = render(
    <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
    {
      initialState: makeStateWithBook()
    }
  );
  const categories = fixtures.book.categories?.join(", ") as string;
  expect(node.getByText(categories));
  expect(node.getByText("Categories:"));
});

test("doesn't show categories when there aren't any", () => {
  const bookWithoutCategories: BookData = merge(fixtures.book, {
    categories: null
  });
  const node = render(
    <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
    {
      initialState: makeStateWithBook(bookWithoutCategories)
    }
  );
  expect(node.queryByText("Categories:")).toBeFalsy();
});

test("shows publisher", () => {
  const node = render(
    <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
    {
      initialState: makeStateWithBook()
    }
  );
  const publisher = fixtures.book.publisher as string;

  expect(node.getByText(publisher)).toBeInTheDocument();
  expect(node.getByText("Publisher:")).toBeInTheDocument();
});

test("shows fulfillment card", () => {
  const node = render(
    <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
    {
      initialState: makeStateWithBook()
    }
  );

  // there are two download buttons in the document becuase we change
  // which is displayed with media queries. But both are always rendered.
  const downloadButtons = node.getAllByText("Download");
  expect(downloadButtons).toHaveLength(2);
});

test("shows download requirements", () => {
  const node = render(
    <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
    {
      initialState: makeStateWithBook()
    }
  );

  /**
   * There are two download requirement cards in the document
   * because we display a different one depending on screen width
   */
  expect(node.getAllByText("Download Requirements:")).toHaveLength(2);
});

test("shows recommendation lanes", () => {
  const node = render(
    <RecommendationsStateContext.Provider
      value={{
        ...fixtures.recommendationsState
      }}
    >
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />
    </RecommendationsStateContext.Provider>,
    {
      initialState: makeStateWithBook()
    }
  );
  expect(node.getByText("Jane Austen")).toBeInTheDocument();
});

/**
 * mock fetchComplaintTypes and postComplaint
 */
const mockBoundFetchComplaintTypes = jest
  .fn()
  .mockResolvedValue(["complaint-type"]);
const fetchComplaintTypesSpy = jest
  .spyOn(complaintActions, "fetchComplaintTypes")
  .mockReturnValue(mockBoundFetchComplaintTypes);
const postComplaintSpy = jest.spyOn(complaintActions, "postComplaint");

const bookWithReportUrl = merge<BookData>(fixtures.book, {
  raw: {
    link: [
      {
        $: {
          rel: {
            value: "issues"
          },
          href: {
            value: "/report-url"
          }
        }
      }
    ]
  }
});

describe("report problem", () => {
  test("shows report problem link", () => {
    const node = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook()
      }
    );

    const reportProblemLink = node.getByTestId("report-problem-link");
    expect(reportProblemLink).toBeInTheDocument();
  });

  test("shows form (only) when clicked", async () => {
    const node = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook()
      }
    );
    // make sure it's not visible at first
    expect(node.getByLabelText("Complaint Type")).not.toBeVisible();

    const reportProblemLink = node.getByTestId("report-problem-link");
    userEvent.click(reportProblemLink);

    // one for the original report problem button, one for the form
    expect(node.getAllByText("Report a problem")).toHaveLength(2);
    expect(node.getByLabelText("Complaint Type")).toBeVisible();
    expect(node.getByLabelText("Details")).toBeVisible();
    expect(node.getByText("Cancel")).toBeVisible();
    expect(node.getByText("Submit")).toBeVisible();
    expect(node.getByText("Submit")).toHaveAttribute("type", "submit");
  });

  test("fetches complaint types", async () => {
    render(<BookDetails setCollectionAndBook={mockSetCollectionAndBook} />, {
      initialState: makeStateWithBook(bookWithReportUrl)
    });
    expect(mockBoundFetchComplaintTypes).toHaveBeenCalledTimes(1);
    expect(mockBoundFetchComplaintTypes).toHaveBeenCalledWith("/report-url");
  });

  test("submits", async () => {
    /**
     * Mock the fetchComplaintTypes function so that it actually
     * loads the complaintTypes into the state, so we can then
     * select them. I tried to mock the state value itself, but that
     * turned out to be quite difficult.
     */
    const complaintTypes = ["complaint-type-a", "complaint-type-b"];
    fetchComplaintTypesSpy.mockImplementationOnce(dispatch => _url => {
      dispatch({
        type: "FETCH_COMPLAINT_TYPES_SUCCESS",
        types: complaintTypes
      });
      return Promise.resolve(complaintTypes);
    });

    const mockBoundPostComplaint = jest.fn().mockResolvedValue(["some-string"]);
    postComplaintSpy.mockReturnValue(_url => mockBoundPostComplaint);

    const node = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook(bookWithReportUrl)
      }
    );
    // open the form
    const reportProblemLink = node.getByTestId("report-problem-link");
    userEvent.click(reportProblemLink);

    // fill the form
    userEvent.selectOptions(
      node.getByLabelText("Complaint Type"),
      "complaint-type-b"
    );
    userEvent.type(node.getByLabelText("Details"), "Some issue happened.");
    // submit the form
    userEvent.click(node.getByText("Submit"));

    // actually posted the complaint
    await wait(() => expect(mockBoundPostComplaint).toHaveBeenCalledTimes(1));
    expect(mockBoundPostComplaint).toHaveBeenCalledWith({
      type: "complaint-type-b",
      detail: "Some issue happened."
    });
  });

  test("displays thank you after submitting", async () => {
    const complaintTypes = ["complaint-type-a", "complaint-type-b"];
    fetchComplaintTypesSpy.mockImplementationOnce(dispatch => _url => {
      dispatch({
        type: "FETCH_COMPLAINT_TYPES_SUCCESS",
        types: complaintTypes
      });
      return Promise.resolve(complaintTypes);
    });

    // make postComplaint dispatch a success message
    postComplaintSpy.mockImplementation(dispatch => _url => _data => {
      dispatch({ type: "POST_COMPLAINT_SUCCESS" });
      return Promise.resolve(["some string"]);
    });

    const node = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook(bookWithReportUrl)
      }
    );
    // open the form
    const reportProblemLink = node.getByTestId("report-problem-link");
    userEvent.click(reportProblemLink);

    // fill the form
    userEvent.selectOptions(
      node.getByLabelText("Complaint Type"),
      "complaint-type-b"
    );
    userEvent.type(node.getByLabelText("Details"), "Some issue happened.");
    // submit the form
    userEvent.click(node.getByText("Submit"));

    // shows thank you message
    expect(
      await node.findByText("Your problem was reported. Thank you!")
    ).toBeInTheDocument();
    expect(await node.findByText("Done")).toBeInTheDocument();

    // can close the form
    userEvent.click(node.getByText("Done"));
    expect(node.getByText("Complaint Type")).not.toBeVisible();
  });

  test("displays client error when unfilled", async () => {
    const mockBoundPostComplaint = jest.fn().mockResolvedValue(["some-string"]);
    postComplaintSpy.mockReturnValue(_url => mockBoundPostComplaint);

    const node = render(<ReportProblem book={fixtures.book} />, {
      initialState: makeStateWithBook(bookWithReportUrl)
    });
    // open the form
    const reportProblemLink = node.getByTestId("report-problem-link");
    userEvent.click(reportProblemLink);

    // don't fill the form
    // submit the form
    userEvent.click(node.getByText("Submit"));

    expect(
      await node.findByText("Error: Please choose a type")
    ).toBeInTheDocument();
    expect(
      await node.findByText("Error: Please enter details about the problem.")
    ).toBeInTheDocument();

    expect(mockBoundPostComplaint).toHaveBeenCalledTimes(0);
  });
});
