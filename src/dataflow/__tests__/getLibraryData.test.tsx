/* eslint-disable camelcase */
import {
  fetchCatalog,
  getCatalogRootUrl,
  fetchAuthDocument,
  buildLibraryData,
  getLibrarySlugs
} from "../getLibraryData";
import fetchMock from "jest-fetch-mock";
import ApplicationError, { PageNotFoundError } from "errors";
import rawCatalog from "test-utils/fixtures/raw-opds-feed";
import { fixtures } from "test-utils";
import { OPDS1, OPDS2 } from "interfaces";
import { getAuthDocHref } from "utils/auth";
import mockConfig from "test-utils/mockConfig";

describe("fetchCatalog", () => {
  test("calls fetch with catalog url", async () => {
    fetchMock.mockResponseOnce(rawCatalog);
    await fetchCatalog("some-url");
    expect(fetchMock).toHaveBeenCalledWith("some-url");
  });

  test("properly parses fetched catalog", async () => {
    fetchMock.mockResponseOnce(rawCatalog);
    const catalog = await fetchCatalog("some-url");
    expect(catalog).toMatchSnapshot();
  });

  test("Throws error if catalog is not correct format", async () => {
    fetchMock.mockResponseOnce("something invalid");
    const promise = fetchCatalog("a url somewhere");
    await expect(promise).rejects.toThrowError(ApplicationError);
    await expect(promise).rejects.toThrow(
      "Could not fetch catalog at: a url somewhere"
    );
  });

  test("Throws error if fetch fails", async () => {
    fetchMock.mockRejectOnce();
    const promise = fetchCatalog("not a valid url");
    await expect(promise).rejects.toThrowError(ApplicationError);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Could not fetch catalog at: not a valid url"`
    );
  });
});

describe("getCatalogRootUrl", () => {
  test("throws PageNotFoundError if no entry found in config file for library", async () => {
    mockConfig({ libraries: { hello: "what" } });
    const promise = getCatalogRootUrl("not there slug");
    await expect(promise).rejects.toThrowError(PageNotFoundError);
    await expect(promise).rejects.toMatchInlineSnapshot(
      `[Page Not Found Error: No catalog root url is configured for the library: not there slug.]`
    );
  });

  test("returns url for existing library in config file", async () => {
    mockConfig({ libraries: { hello: "http://library.com" } });

    const promise = getCatalogRootUrl("hello");
    await expect(promise).resolves.toBe("http://library.com");
  });

  describe("with Registry Base", () => {
    test("Works for Registry Base", async () => {
      mockConfig({ libraries: "http://reg-base.com" });
      fetchMock.mockResponses(
        JSON.stringify(fixtures.opds2.feedWithoutCatalog),
        JSON.stringify(fixtures.opds2.feedWithCatalog)
      );
      const url = await getCatalogRootUrl("library-uuid");
      expect(url).toBe("/catalog-root-feed");
    });

    test("Throws ApplicationError if it doesn't find a catalogRootUrl", async () => {
      mockConfig({ libraries: "reg-base" });
      const missingCatalogRootUrl: OPDS2.LibraryRegistryFeed = {
        ...fixtures.opds2.feedWithCatalog,
        catalogs: [
          {
            ...(fixtures.opds2.feedWithCatalog
              .catalogs?.[0] as OPDS2.CatalogEntry),
            links: []
          }
        ]
      };
      fetchMock.mockResponses(
        JSON.stringify(fixtures.opds2.feedWithoutCatalog),
        JSON.stringify(missingCatalogRootUrl)
      );
      const promise = getCatalogRootUrl("library-uuid");
      expect(promise).rejects.toThrowError(ApplicationError);
      expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
        `"CatalogEntry did not contain a Catalog Root Url. Library UUID: library-uuid"`
      );
    });

    test("Throws an ApplicationError if the LibraryRegistryFeed doesn't have a CatalogEntry", async () => {
      mockConfig({ libraries: "reg-base" });
      fetchMock.mockResponses(
        JSON.stringify(fixtures.opds2.feedWithoutCatalog),
        JSON.stringify(fixtures.opds2.feedWithoutCatalog)
      );
      const promise = getCatalogRootUrl("library-uuid");
      expect(promise).rejects.toThrowError(ApplicationError);
      expect(promise).rejects.toThrow(
        "Could not fetch catalog entry for library: library-uuid at reg-base\nBase Error:\nLibraryRegistryFeed returned by /catalog-template-url-library-uuid does not contain a CatalogEntry."
      );
    });

    test("Throws an ApplicationError if it can't fetch the catalog entry", async () => {
      mockConfig({ libraries: "reg-base" });
      fetchMock.mockResponseOnce(
        JSON.stringify(fixtures.opds2.feedWithoutCatalog)
      );
      const promise = getCatalogRootUrl("library-uuid");
      expect(promise).rejects.toThrowError(ApplicationError);
      expect(promise).rejects.toThrow(
        "Could not fetch catalog entry for library: library-uuid at reg-base\nBase Error:\ninvalid json response body at  reason: Unexpected end of JSON input"
      );
    });

    test("Throws an ApplicationError if the registry doesn't contain a template link", async () => {
      mockConfig({ libraries: "reg-base" });
      const missingTemplateLink: OPDS2.LibraryRegistryFeed = {
        ...fixtures.opds2.feedWithoutCatalog,
        links: []
      };
      fetchMock.mockResponseOnce(JSON.stringify(missingTemplateLink));
      const promise = getCatalogRootUrl("library-uuid");
      expect(promise).rejects.toThrowError(ApplicationError);
      expect(promise).rejects.toThrow(
        "Could not fetch the library template at: reg-base\nBase Error:\nTemplate not present in response from: reg-base"
      );
    });
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

  test("throws ApplicationError if test fails", async () => {
    fetchMock.mockRejectOnce();
    const promise = fetchAuthDocument("/some-url");
    await expect(promise).rejects.toThrowError(ApplicationError);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Could not fetch auth document at url: /some-url"`
    );
  });
});

describe("buildLibraryData", () => {
  test("returns correct response", () => {
    const library = buildLibraryData(
      fixtures.authDoc,
      "/catalog-url",
      "librarySlug",
      fixtures.opdsFeed
    );
    expect(library).toEqual({
      slug: "librarySlug",
      catalogUrl: "/catalog-url",
      catalogName: "auth doc title",
      logoUrl: null,
      colors: null,
      headerLinks: [],
      shelfUrl: null,
      authMethods: [],
      libraryLinks: {},
      searchData: null
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
      "/catalog-url",
      "librarySlug",
      fixtures.opdsFeed
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
      }
    ];

    const library = buildLibraryData(
      {
        ...fixtures.authDoc,
        links
      },
      "/catalog-url",
      "librarySlug",
      fixtures.opdsFeed
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

describe("getAuthDocHref", () => {
  test("correctly finds link to auth doc", () => {
    const authDocLink = getAuthDocHref(fixtures.opdsFeed);
    expect(authDocLink).toBe("/auth-doc");
  });

  test("throws ApplicationError if there is no Auth Document link", () => {
    const func = () =>
      getAuthDocHref({
        ...fixtures.opdsFeed,
        links: []
      });
    expect(func).toThrowError(ApplicationError);
    expect(func).toThrow("OPDS Catalog did not contain an auth document link.");
  });
});

describe("getLibrarySlugs", () => {
  test("returns keys of libraries in config file", async () => {
    mockConfig({
      libraries: {
        somelibrary: "/somewhere",
        anotherlib: "/another"
      }
    });
    expect(await getLibrarySlugs()).toEqual(["somelibrary", "anotherlib"]);
  });

  test("returns an empty array when using a library registry", async () => {
    mockConfig({
      libraries: "http://reg-base.com"
    });
    expect(await getLibrarySlugs()).toEqual(null);
  });
});
