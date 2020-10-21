import * as React from "react";
import { render, fixtures, waitFor } from "test-utils";
import merge from "deepmerge";
import { BookDetails } from "../index";
import { AnyBook } from "interfaces";
import * as complaintActions from "hooks/useComplaints/actions";
import userEvent from "@testing-library/user-event";
import ReportProblem from "../ReportProblem";
import { ServerError } from "errors";
import useSWR from "swr";
import mockConfig from "test-utils/mockConfig";

jest.mock("swr");

const mockedSWR = useSWR as jest.MockedFunction<typeof useSWR>;

function makeSwrResponse(value: Partial<ReturnType<typeof useSWR>>) {
  return {
    data: undefined,
    error: undefined,
    revalidate: jest.fn(),
    isValidating: false,
    mutate: jest.fn(),
    ...value
  };
}
function mockSwr(value: Partial<ReturnType<typeof useSWR>>) {
  mockedSWR.mockReturnValue(makeSwrResponse(value));
}

describe("book details page", () => {
  test("shows loading state", () => {
    mockSwr({ data: undefined });

    const utils = render(<BookDetails />, {
      router: { query: { bookUrl: "/book-url" } }
    });
    expect(
      utils.getByRole("heading", { name: "Loading..." })
    ).toBeInTheDocument();
  });

  test("handles error state", async () => {
    mockSwr({
      error: new ServerError("url", 418, {
        detail: "Something",
        title: "you messed up",
        status: 418
      })
    });

    const utils = render(<BookDetails />, {
      router: { query: { bookUrl: "/book-url" } }
    });

    expect(
      await utils.findByText(
        "There was a problem fetching this book. Please refresh the page or return home."
      )
    ).toBeInTheDocument();
  });

  test("shows categories", () => {
    mockSwr({
      data: fixtures.book
    });
    const utils = render(<BookDetails />, {
      router: { query: { bookUrl: "/book-url" } }
    });
    const categories = fixtures.book.categories?.join(", ") as string;
    expect(utils.getByText(categories));
    expect(utils.getByText("Categories:"));
  });

  test("doesn't show categories when there aren't any", () => {
    const bookWithoutCategories: AnyBook = merge(fixtures.book, {
      categories: null
    });
    mockSwr({ data: bookWithoutCategories });
    const utils = render(<BookDetails />);
    expect(utils.queryByText("Categories:")).toBeFalsy();
  });

  test("shows publisher", () => {
    mockSwr({ data: fixtures.book });
    const utils = render(<BookDetails />);
    const publisher = fixtures.book.publisher as string;

    expect(utils.getByText(publisher)).toBeInTheDocument();
    expect(utils.getByText("Publisher:")).toBeInTheDocument();
  });

  test("does not show simplyE callout when NEXT_PUBLIC_COMPANION_APP is 'openebooks'", () => {
    mockConfig({ companionApp: "openebooks" });
    mockSwr({ data: fixtures.book });
    const utils = render(<BookDetails />);

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
    mockConfig({ companionApp: "simplye" });
    mockSwr({ data: fixtures.book });
    const utils = render(<BookDetails />);

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
    // we make a special mock so we can differentiate the book request
    // and the related collection request
    mockedSWR.mockImplementation((key => {
      if (key === "/book-url") {
        return makeSwrResponse({
          data: {
            ...fixtures.book,
            relatedUrl: "/related-url"
          }
        });
      }
      if (key === "/related-url") {
        return {
          data: fixtures.recommendations
        };
      }
    }) as any);
    const utils = render(<BookDetails />, {
      router: { query: { bookUrl: "/book-url" } }
    });
    expect(utils.getByText("Recommendations")).toBeInTheDocument();
    expect(
      utils.getByRole("heading", { name: "Lane Title" })
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

const bookWithReportUrl = merge<AnyBook>(fixtures.book, {
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
    mockSwr({ data: fixtures.book });
    const utils = render(<BookDetails />);

    const reportProblemLink = utils.getByTestId("report-problem-link");
    expect(reportProblemLink).toBeInTheDocument();
  });

  test("shows form (only) when clicked", async () => {
    mockSwr({ data: fixtures.book });
    const utils = render(<BookDetails />);
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
    mockSwr({ data: fixtures.book });
    render(<BookDetails />);
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

    mockSwr({ data: fixtures.book });
    const utils = render(<BookDetails />);
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

    mockSwr({ data: fixtures.book });
    const utils = render(<BookDetails />);
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

    mockSwr({ data: bookWithReportUrl });
    const utils = render(<ReportProblem book={fixtures.borrowableBook} />);
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
