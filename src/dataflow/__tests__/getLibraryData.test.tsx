/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
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
import * as env from "utils/env";
import rawCatalog from "test-utils/fixtures/raw-opds-feed";
import { fixtures } from "test-utils";
import { AuthDocumentLink } from "interfaces";

function setEnv({
  CONFIG_FILE = undefined,
  CIRCULATION_MANAGER_BASE = undefined,
  REGISTRY_BASE = undefined
}: {
  CONFIG_FILE?: string;
  CIRCULATION_MANAGER_BASE?: string;
  REGISTRY_BASE?: string;
}) {
  (env.CONFIG_FILE as any) = CONFIG_FILE;
  (env.CIRCULATION_MANAGER_BASE as any) = CIRCULATION_MANAGER_BASE;
  (env.REGISTRY_BASE as any) = REGISTRY_BASE;
}

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

  test("Works for Registry Base", async () => {
    setEnv({ REGISTRY_BASE: "reg-base" });
    const url = await getCatalogRootUrl("lib-on-registry");
    expect(url).toBe("http://lib-on-registry");
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
      `"One of CONFIG_FILE, REGISTRY_BASE, or SIMPLIFIED_CATALOG_BASE must be defined."`
    );
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
      colors: {
        primary: null,
        secondary: null
      },
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

  test("returns all registry uuids", async () => {
    expect(2).toBe(1);
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
