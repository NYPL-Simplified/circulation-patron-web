/* eslint-disable camelcase */
import {
  fetchCatalog,
  getCatalogRootUrl,
  fetchAuthDocument,
  buildLibraryData,
  getLibrarySlugs,
  getAuthDocHref
} from "../getLibraryData";
import getConfigFile from "../getConfigFile";
import fetchMock from "jest-fetch-mock";
import ApplicationError, { PageNotFoundError, AppSetupError } from "errors";
import rawCatalog from "test-utils/fixtures/raw-opds-feed";
import { fixtures, setEnv } from "test-utils";
import { AuthDocumentLink, OPDS2 } from "interfaces";

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

jest.mock("../getConfigFile");
const mockGetConfigFile = getConfigFile as jest.MockedFunction<
  typeof getConfigFile
>;
mockGetConfigFile.mockResolvedValue({
  somelibrary: "somelibraryurl",
  anotherlib: "anotherliburl"
});

describe("getCatalogRootUrl", () => {
  test("throws error if there is a library slug and CIRCULATION_MANAGER_BASE", async () => {
    setEnv({ CIRCULATION_MANAGER_BASE: "some-base" });
    const promise = getCatalogRootUrl("some-slug");
    await expect(promise).rejects.toThrowError(ApplicationError);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"App is running with a single Circ Manager, but you're trying to access a multi-library route: some-slug"`
    );
  });

  test("throws error if there is a CIRCULATION_MANAGER_BASE and REGISTRY_BASE at the same time", async () => {
    setEnv({
      CIRCULATION_MANAGER_BASE: "some-base",
      REGISTRY_BASE: "something"
    });
    const promise = getCatalogRootUrl();
    await expect(promise).rejects.toThrowError(AppSetupError);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"App is set up with SIMPLIFIED_CATALOG_BASE and either CONFIG_FILE or REGISTRY. You should only have one defined."`
    );
  });

  test("throws error if there is a CIRCULATION_MANAGER_BASE and CONFIG_FILE at the same time", async () => {
    setEnv({
      CIRCULATION_MANAGER_BASE: "some-base",
      CONFIG_FILE: "something"
    });
    const promise = getCatalogRootUrl();
    await expect(promise).rejects.toThrowError(AppSetupError);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"App is set up with SIMPLIFIED_CATALOG_BASE and either CONFIG_FILE or REGISTRY. You should only have one defined."`
    );
  });

  test("throws error if there is a CONFIG_FILE and REGISTRY_BASE at the same time", async () => {
    setEnv({
      CONFIG_FILE: "something",
      REGISTRY_BASE: "some base"
    });
    const promise = getCatalogRootUrl("slug");
    await expect(promise).rejects.toThrowError(AppSetupError);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"You can only have one of SIMPLIFIED_CATALOG_BASE and REGISTRTY_BASE defined at one time."`
    );
  });
  test("throws PageNotFoundError if running multiple libraries and no slug provided", async () => {
    setEnv({
      CONFIG_FILE: "config-file"
    });
    const promise = getCatalogRootUrl();
    await expect(promise).rejects.toThrowError(PageNotFoundError);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Library slug must be provided when running with multiple libraries."`
    );
  });

  test("throws PageNotFoundError if no entry found in config file for library", async () => {
    setEnv({
      CONFIG_FILE: "config-file"
    });
    const promise = getCatalogRootUrl("not there slug");
    await expect(promise).rejects.toThrowError(PageNotFoundError);
    await expect(promise).rejects.toMatchInlineSnapshot(
      `[Page Not Found Error: No CONFIG_FILE entry for library: not there slug]`
    );
  });

  test("returns url for existing library in config file", async () => {
    setEnv({ CONFIG_FILE: "config-file" });
    const promise = getCatalogRootUrl("anotherlib");
    await expect(promise).resolves.toBe("anotherliburl");
  });

  test("works for SIMPLIFIED_CATALOG_BASE", async () => {
    setEnv({ CIRCULATION_MANAGER_BASE: "hello" });
    const url = await getCatalogRootUrl();
    expect(url).toBe("hello");
  });

  test("Throws AppSetupError if no env var is defined", async () => {
    setEnv({});
    const promise = getCatalogRootUrl("hello");
    expect(promise).rejects.toThrowError(AppSetupError);
    expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Application must be run with one of SIMPLIFIED_CATALOG_BASE, CONFIG_FILE or REGISTRY_BASE."`
    );
  });

  test("Throws AppSetupError if no env var is defined and no librarySlug provided", async () => {
    setEnv({});
    const promise = getCatalogRootUrl();
    expect(promise).rejects.toThrowError(AppSetupError);
    expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Application must be run with one of SIMPLIFIED_CATALOG_BASE, CONFIG_FILE or REGISTRY_BASE."`
    );
  });

  describe("with Registry Base", () => {
    test("Works for Registry Base", async () => {
      setEnv({ REGISTRY_BASE: "reg-base" });
      fetchMock.mockResponses(
        JSON.stringify(fixtures.opds2.feedWithoutCatalog),
        JSON.stringify(fixtures.opds2.feedWithCatalog)
      );
      const url = await getCatalogRootUrl("library-uuid");
      expect(url).toBe("/catalog-root-feed");
    });

    test("Throws ApplicationError if it doesn't find a catalogRootUrl", async () => {
      setEnv({ REGISTRY_BASE: "reg-base" });
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
      setEnv({ REGISTRY_BASE: "reg-base" });
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
      setEnv({ REGISTRY_BASE: "reg-base" });
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
      setEnv({ REGISTRY_BASE: "reg-base" });
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
      "librarySlug"
    );
    expect(library).toEqual({
      slug: "librarySlug",
      catalogUrl: "/catalog-url",
      catalogName: "auth doc title",
      logoUrl: null,
      colors: null,
      headerLinks: [],
      libraryLinks: {}
    });
  });

  test("works correctly without librarySlug", () => {
    const library = buildLibraryData(
      fixtures.authDoc,
      "/catalog-url",
      undefined
    );
    expect(library.slug).toBeNull();
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
      "librarySlug"
    );
    expect(library.colors).toEqual({
      primary: "blue",
      secondary: "red"
    });
  });

  test("correctly parses links", () => {
    const links: AuthDocumentLink[] = [
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
  test("returns an empty array if running with CIRCULATION_MANAGER_BASE", async () => {
    setEnv({ CIRCULATION_MANAGER_BASE: "some base" });
    expect(await getLibrarySlugs()).toEqual([]);
  });

  test("returns keys of config file", async () => {
    setEnv({ CONFIG_FILE: "some-config-file" });
    expect(await getLibrarySlugs()).toEqual(["somelibrary", "anotherlib"]);
  });

  test("returns an empty array when using a library registry", async () => {
    setEnv({ REGISTRY_BASE: "some-registry" });
    expect(await getLibrarySlugs()).toEqual([]);
  });

  test("throws ApplicationError if env improperly set", async () => {
    setEnv({});
    const promise = getLibrarySlugs();
    expect(promise).rejects.toThrowError(ApplicationError);
    expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unable to get library slugs for current setup."`
    );
  });
});
