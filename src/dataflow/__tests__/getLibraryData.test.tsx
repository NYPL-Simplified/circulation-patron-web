/* eslint-disable camelcase */
import {
  fetchAuthDocument,
  buildLibraryData,
  getAuthDocUrl
} from "../getLibraryData";
import fetchMock from "jest-fetch-mock";
import ApplicationError, { PageNotFoundError } from "errors";
import rawCatalog from "test-utils/fixtures/raw-opds-feed";
import { fixtures } from "test-utils";
import { OPDS1 } from "interfaces";
import mockConfig from "test-utils/mockConfig";
import { fetchFeed } from "dataflow/opds1/fetch";

describe("fetching catalog", () => {
  test("calls fetch with catalog url", async () => {
    fetchMock.mockResponseOnce(rawCatalog);
    await fetchFeed("some-url");
    expect(fetchMock).toHaveBeenCalledWith("some-url", {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    });
  });

  test("properly parses fetched catalog", async () => {
    fetchMock.mockResponseOnce(rawCatalog);
    const catalog = await fetchFeed("some-url");
    expect(catalog).toMatchSnapshot();
  });

  test("Throws error if catalog is not correct format", async () => {
    fetchMock.mockResponseOnce("something invalid");
    const promise = fetchFeed("a url somewhere");
    await expect(promise).rejects.toThrowError(ApplicationError);
    await expect(promise).rejects.toThrow(
      "Could not parse fetch response into an OPDS Feed or Entry"
    );
  });

  test("Throws error if fetch fails", async () => {
    fetchMock.mockRejectOnce(new Error("Something wrong"));
    const promise = fetchFeed("not a valid url");
    await expect(promise).rejects.toThrowError(Error);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Fetch Error: The fetch promise for the requested resource was rejected. This is probably an offline, CORS, or other network error. Requested URL: not a valid url"`
    );
  });
});

describe("getAuthDocUrl", () => {
  test("throws PageNotFoundError if no entry found in config file for library", async () => {
    mockConfig({ libraries: {} });
    const promise = getAuthDocUrl("not there slug");
    await expect(promise).rejects.toThrowError(PageNotFoundError);
    await expect(promise).rejects.toMatchInlineSnapshot(
      `[Page Not Found Error: Page Not Found: No authentication document url is configured for the library: not there slug.]`
    );
  });

  test("returns url for existing library in config file", async () => {
    mockConfig({
      libraries: { hello: { title: "hello", authDocUrl: "http://library.com" } }
    });

    const promise = getAuthDocUrl("hello");
    await expect(promise).resolves.toBe("http://library.com");
  });
});

describe("fetchAuthDocument", () => {
  test("calls the auth document url and returns json", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        some: "json"
      })
    );

    const json = await fetchAuthDocument("/auth-doc");
    expect(fetchMock).toHaveBeenCalledWith("/auth-doc");
    expect(json).toEqual({
      some: "json"
    });
  });

  test("passes fetch errors through", async () => {
    fetchMock.mockRejectOnce(new Error("Something not right"));
    const promise = fetchAuthDocument("/some-url");
    await expect(promise).rejects.toThrowError(Error);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Something not right"`
    );
  });
});

describe("buildLibraryData", () => {
  test("returns correct response", () => {
    const library = buildLibraryData(fixtures.authDoc, "librarySlug");
    expect(library).toEqual({
      slug: "librarySlug",
      catalogUrl: "/catalog-root",
      catalogName: "auth doc title",
      logoUrl: null,
      colors: null,
      headerLinks: [],
      shelfUrl: null,
      authMethods: [],
      libraryLinks: {}
    });
  });

  test("correctly parses web_color_scheme", () => {
    const library = buildLibraryData(
      {
        ...fixtures.authDoc,
        web_color_scheme: {
          primary: "blue",
          secondary: "red"
        }
      },
      "librarySlug"
    );
    expect(library.colors).toEqual({
      primary: "blue",
      secondary: "red"
    });
  });

  test("correctly parses links", () => {
    const links: OPDS1.AuthDocumentLink[] = [
      {
        rel: "about",
        href: "/about"
      },
      {
        rel: "alternate",
        href: "/alternate"
      },
      {
        rel: "privacy-policy",
        href: "/privacy-policy"
      },
      {
        rel: "terms-of-service",
        href: "/terms-of-service"
      },
      {
        rel: "help",
        href: "/help-website",
        type: "text/html"
      },
      {
        rel: "help",
        href: "helpEmail"
      },
      {
        rel: "register",
        href: "/register"
      },
      {
        rel: "logo",
        href: "/logo"
      },
      {
        rel: "navigation",
        href: "/navigation-one"
      },
      {
        rel: "navigation",
        href: "/navigation-two"
      },
      {
        rel: "start",
        href: "/catalog-root"
      }
    ];

    const library = buildLibraryData(
      {
        ...fixtures.authDoc,
        links
      },
      "librarySlug"
    );

    expect(library.headerLinks).toEqual([
      { rel: "navigation", href: "/navigation-one" },
      { rel: "navigation", href: "/navigation-two" }
    ]);

    expect(library.libraryLinks).toEqual({
      about: {
        rel: "about",
        href: "/about"
      },
      libraryWebsite: {
        rel: "alternate",
        href: "/alternate"
      },
      privacyPolicy: {
        rel: "privacy-policy",
        href: "/privacy-policy"
      },
      tos: {
        rel: "terms-of-service",
        href: "/terms-of-service"
      },
      helpWebsite: {
        rel: "help",
        type: "text/html",
        href: "/help-website"
      },
      helpEmail: {
        rel: "help",
        href: "helpEmail"
      }
    });

    expect(library.logoUrl).toBe("/logo");
  });
});
