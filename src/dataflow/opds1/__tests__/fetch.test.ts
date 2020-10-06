import {
  fetchBook,
  fetchCollection,
  fetchEntry,
  fetchFeed,
  fetchOPDS,
  fetchSearchData
} from "dataflow/opds1/fetch";
import ApplicationError, { ServerError } from "errors";
import fetchMock from "jest-fetch-mock";
import { OPDSEntry, OPDSFeed } from "opds-feed-parser";
import rawOpdsFeed from "test-utils/fixtures/raw-opds-feed";
import rawOpdsEntry from "test-utils/fixtures/raw-opds-entry";

describe("fetchOPDS", () => {
  /**
   * - parses response text into opds feed
   * - throws application error if it cannot parse
   */
  test("fetches with headers", async () => {
    fetchMock.once(rawOpdsEntry);
    await fetchOPDS("/some-url");
    expect(fetchMock).toHaveBeenCalledWith("/some-url", {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    });

    fetchMock.once(rawOpdsEntry);
    await fetchOPDS("/some-url", "some-token");
    expect(fetchMock).toHaveBeenCalledWith("/some-url", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "some-token"
      }
    });
  });

  test("throws server error if response not okay", async () => {
    fetchMock.mockReject(
      new ServerError("/some-url", 418, {
        detail: "you screwed it up",
        title: "wrong",
        status: 418
      })
    );
    await expect(fetchOPDS("/some-url")).rejects.toThrowError(ServerError);
  });

  test("parses response into opds feed", async () => {
    fetchMock.mockResponseOnce(rawOpdsFeed);

    const feed = await fetchOPDS("/some-url");
    expect(feed).toBeInstanceOf(OPDSFeed);
  });

  test("throws application error if it cannot parse", async () => {
    fetchMock.mockResponseOnce("blah blah blah");
    await expect(fetchOPDS("/some-url")).rejects.toThrowError(ApplicationError);
  });
});

describe("fetchFeed", () => {
  test("throws application error if returned value is not a feed", async () => {
    fetchMock.mockResponseOnce(rawOpdsEntry);

    await expect(fetchFeed("/some-url")).rejects.toThrowError(ApplicationError);
  });

  test("doesn't throw if response is feed", async () => {
    fetchMock.mockResponseOnce(rawOpdsFeed);

    const feed = await fetchFeed("/some-url");
    expect(feed).toBeInstanceOf(OPDSFeed);
  });
});

describe("fetchEntry", () => {
  test("throws application error if returned value is not an entry", async () => {
    fetchMock.mockResponseOnce(rawOpdsFeed);

    await expect(fetchEntry("/some-url")).rejects.toThrowError(
      ApplicationError
    );
  });

  test("doesn't throw if response is entry", async () => {
    fetchMock.mockResponseOnce(rawOpdsEntry);

    const entry = await fetchEntry("/some-url");
    expect(entry).toBeInstanceOf(OPDSEntry);
  });
});

describe("fetchCollection", () => {
  test("parses feed into collection", async () => {
    fetchMock.mockResponseOnce(rawOpdsFeed);

    const collection = await fetchCollection("http://somewhere");
    expect(collection.books).toHaveLength(6);
  });
});

describe("fetchBook", () => {
  test("parses enry into book", async () => {
    fetchMock.mockResponseOnce(rawOpdsEntry);

    const book = await fetchBook("/somwhere", "http://catalog.com");
    expect(book.authors).toHaveLength(2);
  });
});

describe("fetchSearchData", () => {
  test("fetches url", async () => {
    fetchMock.once(`
    <OpenSearchDescription>
      <Description>d</Description>
      <ShortName>s</ShortName>
      <Url template="http://example.com/{searchTerms}" />
    </OpenSearchDescription>
    `);
    fetchSearchData("http://search");
    expect(fetchMock).toHaveBeenCalledWith("http://search");
  });
  test("returns undefined when no url provided", async () => {
    expect(await fetchSearchData()).toBeUndefined();
  });

  test("throws error if fetch fails", async () => {
    fetchMock.mockRejectOnce(new Error("Something went wrong"));
    await expect(fetchSearchData("/somewhere")).rejects.toThrowError(Error);
  });

  test("throws ServerError if response not okay", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        detail: "you messed up",
        title: "wrong!",
        status: 418
      }),
      { status: 418 }
    );
    await expect(fetchSearchData("/blah")).rejects.toThrowError(ServerError);
  });

  test("parses as text if properly fetched", async () => {
    fetchMock.once(`
    <OpenSearchDescription>
      <Description>d</Description>
      <ShortName>s</ShortName>
      <Url template="http://example.com/{searchTerms}" />
    </OpenSearchDescription>
    `);

    const data = await fetchSearchData("http://somewhere");
    expect(data).toEqual({
      description: "d",
      shortName: "s",
      template: "http://example.com/{searchTerms}",
      url: "http://somewhere"
    });
  });
});
