import * as React from "react";
import { render, fixtures, actions, waitFor } from "../../../test-utils";
import merge from "deepmerge";
import { BookDetails } from "../index";
import { State } from "opds-web-client/lib/state";
import { BookData, CollectionData } from "opds-web-client/lib/interfaces";
import * as complaintActions from "../../../hooks/useComplaints/actions";
import { RecommendationsStateContext } from "../../context/RecommendationsContext";
import userEvent from "@testing-library/user-event";
import ReportProblem from "../ReportProblem";
import * as env from "../../../utils/env";

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

describe("book details page", () => {
  test("shows loading state", () => {
    const utils = render(
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
    expect(
      utils.getByRole("heading", { name: "Loading..." })
    ).toBeInTheDocument();
  });

  test("handles error state", () => {
    const utils = render(
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
    expect(utils.container).toMatchSnapshot();
  });

  test("shows categories", () => {
    const utils = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook()
      }
    );
    const categories = fixtures.book.categories?.join(", ") as string;
    expect(utils.getByText(categories));
    expect(utils.getByText("Categories:"));
  });

  test("doesn't show categories when there aren't any", () => {
    const bookWithoutCategories: BookData = merge(fixtures.book, {
      categories: null
    });
    const utils = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook(bookWithoutCategories)
      }
    );
    expect(utils.queryByText("Categories:")).toBeFalsy();
  });

  test("shows publisher", () => {
    const utils = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook()
      }
    );
    const publisher = fixtures.book.publisher as string;

    expect(utils.getByText(publisher)).toBeInTheDocument();
    expect(utils.getByText("Publisher:")).toBeInTheDocument();
  });

  test("shows fulfillment card in open-access state", () => {
    const utils = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook()
      }
    );

    expect(
      utils.getByText("This open-access book is available to keep forever.")
    );
    expect(
      utils.getByRole("button", { name: "Borrow to read on a mobile device" })
    ).toBeInTheDocument();
  });

  test("does not show simplyE callout when NEXT_PUBLIC_COMPANION_APP is 'openebooks'", () => {
    (env.NEXT_PUBLIC_COMPANION_APP as string) = "openebooks";
    const utils = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook()
      }
    );

    expect(
      utils.queryByText("Read Now. Read Everywhere.")
    ).not.toBeInTheDocument();

    expect(utils.queryByText("SimplyE Logo")).not.toBeInTheDocument();
    expect(
      utils.queryByText(
        "Browse and read our collection of eBooks and Audiobooks right from your phone."
      )
    ).not.toBeInTheDocument();
  });

  test("shows simplyE callout when NEXT_PUBLIC_COMPANION_APP is 'simplye'", async () => {
    (env.NEXT_PUBLIC_COMPANION_APP as string) = "simplye";
    const utils = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook()
      }
    );

    expect(utils.getByText("Read Now. Read Everywhere.")).toBeInTheDocument();
    expect(utils.getByLabelText("SimplyE Logo")).toBeInTheDocument();
    expect(
      utils.getByText(
        "Browse and read our collection of eBooks and Audiobooks right from your phone."
      )
    ).toBeInTheDocument();

    const iosBadge = utils.getByRole("link", {
      name: "Download SimplyE on the Apple App Store",
      hidden: true // it is initially hidden by a media query, only displayed on desktop
    });
    expect(iosBadge).toBeInTheDocument();
    expect(iosBadge).toHaveAttribute(
      "href",
      "https://apps.apple.com/us/app/simplye/id1046583900"
    );

    const googleBadge = utils.getByRole("link", {
      name: "Get SimplyE on the Google Play Store",
      hidden: true // hidden initially on mobile
    });
    expect(googleBadge).toBeInTheDocument();
    expect(googleBadge).toHaveAttribute(
      "href",
      "https://play.google.com/store/apps/details?id=org.nypl.simplified.simplye&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
    );
  });

  test("shows recommendation lanes", () => {
    const utils = render(
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
    expect(utils.getByText("Recommendations")).toBeInTheDocument();
    expect(
      utils.getByRole("heading", { name: "Jane Austen" })
    ).toBeInTheDocument();
  });
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
    const utils = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook()
      }
    );

    const reportProblemLink = utils.getByTestId("report-problem-link");
    expect(reportProblemLink).toBeInTheDocument();
  });

  test("shows form (only) when clicked", async () => {
    const utils = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook()
      }
    );
    // make sure it's not visible at first
    expect(utils.getByLabelText("Complaint Type")).not.toBeVisible();

    const reportProblemLink = utils.getByTestId("report-problem-link");
    userEvent.click(reportProblemLink);

    // one for the original report problem button, one for the form
    expect(utils.getAllByText("Report a problem")).toHaveLength(2);
    expect(utils.getByLabelText("Complaint Type")).toBeVisible();
    expect(utils.getByLabelText("Details")).toBeVisible();
    expect(utils.getByText("Cancel")).toBeVisible();
    expect(utils.getByText("Submit")).toBeVisible();
    expect(utils.getByText("Submit")).toHaveAttribute("type", "submit");
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

    const utils = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook(bookWithReportUrl)
      }
    );
    // open the form
    const reportProblemLink = utils.getByTestId("report-problem-link");
    userEvent.click(reportProblemLink);

    // fill the form
    userEvent.selectOptions(
      utils.getByLabelText("Complaint Type"),
      "complaint-type-b"
    );
    userEvent.type(utils.getByLabelText("Details"), "Some issue happened.");
    // submit the form
    userEvent.click(utils.getByText("Submit"));

    // actually posted the complaint
    await waitFor(() =>
      expect(mockBoundPostComplaint).toHaveBeenCalledTimes(1)
    );
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

    const utils = render(
      <BookDetails setCollectionAndBook={mockSetCollectionAndBook} />,
      {
        initialState: makeStateWithBook(bookWithReportUrl)
      }
    );
    // open the form
    const reportProblemLink = utils.getByTestId("report-problem-link");
    userEvent.click(reportProblemLink);

    // fill the form
    userEvent.selectOptions(
      utils.getByLabelText("Complaint Type"),
      "complaint-type-b"
    );
    userEvent.type(utils.getByLabelText("Details"), "Some issue happened.");
    // submit the form
    userEvent.click(utils.getByText("Submit"));

    // shows thank you message
    expect(
      await utils.findByText("Your problem was reported. Thank you!")
    ).toBeInTheDocument();
    expect(await utils.findByText("Done")).toBeInTheDocument();

    // can close the form
    userEvent.click(utils.getByText("Done"));
    expect(utils.getByText("Complaint Type")).not.toBeVisible();
  });

  test("displays client error when unfilled", async () => {
    const mockBoundPostComplaint = jest.fn().mockResolvedValue(["some-string"]);
    postComplaintSpy.mockReturnValue(_url => mockBoundPostComplaint);

    const utils = render(<ReportProblem book={fixtures.book} />, {
      initialState: makeStateWithBook(bookWithReportUrl)
    });
    // open the form
    const reportProblemLink = utils.getByTestId("report-problem-link");
    userEvent.click(reportProblemLink);

    // don't fill the form
    // submit the form
    userEvent.click(utils.getByText("Submit"));

    expect(
      await utils.findByText("Error: Please choose a type")
    ).toBeInTheDocument();
    expect(
      await utils.findByText("Error: Please enter details about the problem.")
    ).toBeInTheDocument();

    expect(mockBoundPostComplaint).toHaveBeenCalledTimes(0);
  });
});
