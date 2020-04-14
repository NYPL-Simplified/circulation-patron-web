/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable camelcase */
const fetchMock = require("fetch-mock");

/**
 * we disable console warns in this file because otherwise our tests are polluted.
 * These warns are helpful, however, in dev and production
 */
const consoleErrorSpy = jest.spyOn(global.console, "warn");
consoleErrorSpy.mockImplementation(() => null);

import LibraryDataCache, {
  AuthDocument,
  CacheEntry
} from "../LibraryDataCache";
import { OPDSFeed } from "opds-feed-parser";

describe("LibraryDataCache", () => {
  let getCatalog;
  let getAuthDocument;
  class LibraryDataCacheWithCatalogAndAuthDocument extends LibraryDataCache {
    getCatalog(url: string): Promise<OPDSFeed> {
      return getCatalog();
    }
    getAuthDocument(catalog: OPDSFeed): Promise<AuthDocument> {
      return getAuthDocument();
    }
  }

  beforeEach(() => {
    const feed = new OPDSFeed({
      id: "1",
      title: "Library",
      updated: "20180102",
      entries: [],
      links: [
        {
          rel: "related",
          href: "http://library.org/1.html",
          type: "text/html",
          title: "One",
          role: "navigation"
        },
        {
          rel: "related",
          href: "http://library.org/2.html",
          type: "text/html",
          title: "Two",
          role: "navigation"
        },
        {
          rel: "about",
          href: "about.html",
          type: "text/html",
          title: "About",
          role: ""
        }
      ],
      complete: true,
      search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
      unparsed: {}
    });
    getCatalog = jest.fn().mockResolvedValue(feed);
    getAuthDocument = jest
      .fn()
      .mockResolvedValue({ links: [], title: "title" });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  describe("getLibraryUrlTemplate", () => {
    test("fetches registry base url to get url template", async () => {
      const cache = new LibraryDataCache("base-url");
      const template = "/library/{uuid}";
      const registryCatalog = {
        links: [
          {
            rel: "http://librarysimplified.org/rel/registry/library",
            href: template
          }
        ]
      };

      fetchMock.mock("/base-url", { status: 200, body: registryCatalog });
      const fetchArgs = fetchMock.calls();

      const uncachedResult = await cache.getLibraryUrlTemplate();
      expect(uncachedResult).toBe(template);
      expect(fetchMock.called()).toBe(true);
      expect(fetchArgs.length).toBe(1);
      expect(fetchArgs[0][0]).toBe("/base-url");

      // Now the template is cached so fetch won't be called again.
      const cachedResult = await cache.getLibraryUrlTemplate();
      expect(cachedResult).toBe(template);
      expect(fetchArgs.length).toBe(1);
    });

    test("throws an error if the registry returns an error", async () => {
      const cache = new LibraryDataCache("base-url");
      fetchMock.mock("/base-url", 400);

      await expect(
        cache.getLibraryUrlTemplate()
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Library registry is not available."`
      );
      expect(fetchMock.called()).toBe(true);
    });
  });

  describe("getDataFromAuthDocumentAndCatalog", () => {
    const authDocument = {
      title: "title",
      links: [
        {
          href: "http://library.org/logo",
          rel: "logo"
        },
        {
          href: "http://library.org/style.css",
          rel: "stylesheet"
        },
        {
          href: "http://library.org/style2.css",
          rel: "stylesheet"
        }
      ],
      web_color_scheme: {
        background: "#000000",
        foreground: "#ffffff"
      }
    };

    const feed = new OPDSFeed({
      id: "1",
      title: "Library",
      updated: "20180102",
      entries: [],
      links: [
        {
          rel: "related",
          href: "http://library.org/1.html",
          type: "text/html",
          title: "One",
          role: "navigation"
        },
        {
          rel: "related",
          href: "http://library.org/2.html",
          type: "text/html",
          title: "Two",
          role: "navigation"
        },
        {
          rel: "about",
          href: "about.html",
          type: "text/html",
          title: "About",
          role: ""
        }
      ],
      complete: true,
      search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
      unparsed: {}
    });

    test("returns data", () => {
      const cache = new LibraryDataCache("base-url");
      const data = cache.getDataFromAuthDocumentAndCatalog(authDocument, feed);
      expect(data.catalogName).toBe("title");
      expect(data.logoUrl).toBe("http://library.org/logo");
      expect(data.cssLinks).toEqual([
        authDocument.links[1],
        authDocument.links[2]
      ]);
      expect(data.colors).toEqual(authDocument.web_color_scheme);
      expect(data.headerLinks).toEqual([feed.links[0], feed.links[1]]);
    });
  });

  describe("getLibraryData", () => {
    const cacheEntry = {
      registryEntry: {
        links: [
          {
            href: "http://library.org/catalog",
            rel: "http://opds-spec.org/catalog"
          }
        ],
        metadata: {
          updated: "20180901",
          id: "uuid",
          title: "the library in the registry"
        }
      },
      authDocument: {
        title: "the library in the auth document",
        links: [
          {
            href: "http://library.org/logo",
            rel: "logo"
          }
        ],
        web_color_scheme: {
          background: "#000000",
          foreground: "#ffffff"
        }
      },
      catalog: new OPDSFeed({
        id: "1",
        title: "Library",
        updated: "20180102",
        entries: [],
        links: [
          {
            rel: "related",
            href: "http://library.org/1.html",
            type: "text/html",
            title: "one",
            role: "navigation"
          },
          {
            rel: "related",
            href: "http://library.org/2.html",
            type: "text/html",
            title: "two",
            role: "navigation"
          },
          {
            rel: "about",
            href: "about.html",
            type: "text/html",
            title: "About",
            role: ""
          }
        ],
        complete: true,
        search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
        unparsed: {}
      }),
      timestamp: new Date().getTime()
    };
    let getCacheEntry;
    // Create a mock class that already has a cache entry.
    class LibraryDataCacheWithEntry extends LibraryDataCache {
      async getCacheEntry(library: string): Promise<CacheEntry> {
        return getCacheEntry();
      }
    }

    beforeEach(() => {
      getCacheEntry = jest.fn().mockResolvedValue(cacheEntry);
    });

    test("converts cache entry from registry to library data", async () => {
      const cache = new LibraryDataCacheWithEntry("base-url");
      const libraryData = await cache.getLibraryData("uuid");

      expect(libraryData.id).toBe("uuid");
      expect(libraryData.catalogUrl).toBe("http://library.org/catalog");
      expect(libraryData.catalogName).toBe("the library in the auth document");
      expect(libraryData.logoUrl).toBe("http://library.org/logo");
      expect(libraryData.onlyLibrary).toBeUndefined();
      expect(libraryData.colors?.background).toBe("#000000");
      expect(libraryData.colors?.foreground).toBe("#ffffff");
      expect(libraryData.headerLinks).toEqual([
        {
          href: "http://library.org/1.html",
          title: "one",
          rel: "related",
          type: "text/html",
          role: "navigation"
        },
        {
          href: "http://library.org/2.html",
          title: "two",
          rel: "related",
          type: "text/html",
          role: "navigation"
        }
      ]);
    });

    test("converts cache entry from config to library data", async () => {
      (cacheEntry as any).registryEntry = null;
      const config = { library: "http://libraryfromconfig.org" };
      const cache = new LibraryDataCacheWithEntry(undefined, 100, config);
      const libraryData = await cache.getLibraryData("library");
      expect(libraryData.id).toBe("library");
      expect(libraryData.catalogUrl).toBe("http://libraryfromconfig.org");
      expect(libraryData.catalogName).toBe("the library in the auth document");
      expect(libraryData.logoUrl).toBe("http://library.org/logo");
      expect(libraryData.onlyLibrary).toBeUndefined();
      expect(libraryData.colors?.background).toBe("#000000");
      expect(libraryData.colors?.foreground).toBe("#ffffff");
      expect(libraryData.headerLinks).toEqual([
        {
          href: "http://library.org/1.html",
          title: "one",
          rel: "related",
          type: "text/html",
          role: "navigation"
        },
        {
          href: "http://library.org/2.html",
          title: "two",
          rel: "related",
          type: "text/html",
          role: "navigation"
        }
      ]);
    });
  });

  describe("getCacheEntry", () => {
    // Create a mock cache class that already has a url template as well
    // an auth document and catalog.
    class LibraryDataCacheWithTemplate extends LibraryDataCacheWithCatalogAndAuthDocument {
      protected libraryUrlTemplate = "/library/{uuid}";
    }
    const registryEntry = {
      links: [
        {
          href: "http://library.org/catalog",
          rel: "http://opds-spec.org/catalog"
        }
      ],
      metadata: {
        updated: "20180901",
        id: "uuid",
        title: "the library"
      }
    };

    test("fetches an entry from the registry if it's not in the cache", async () => {
      const cache = new LibraryDataCacheWithTemplate("base-url");

      // What gets called in `getRegistryEntry`
      fetchMock.mock("/library/uuid", {
        status: 200,
        body: { catalogs: [registryEntry] }
      });
      const fetchArgs = fetchMock.calls();

      const uncachedResult = await cache.getCacheEntry("uuid");
      expect(uncachedResult.registryEntry).toEqual(registryEntry);
      expect(uncachedResult.authDocument).toEqual({
        links: [],
        title: "title"
      });
      expect(fetchMock.called()).toBe(true);
      expect(fetchArgs.length).toBe(1);
      expect(fetchArgs[0][0]).toBe("/library/uuid");
      expect(getCatalog).toHaveBeenCalledTimes(1);
      expect(getAuthDocument).toHaveBeenCalledTimes(1);

      // Now the entry is in the cache so fetch won't be called again.
      const cachedResult = await cache.getCacheEntry("uuid");
      expect(fetchArgs.length).toBe(1);
      expect(cachedResult.registryEntry).toEqual(registryEntry);
      expect(cachedResult.authDocument).toEqual({
        links: [],
        title: "title"
      });
    });

    test("fetches an entry from the config file if it's not in the cache", async () => {
      const config = { library: "http://libraryfromconfig.org" };
      const cache = new LibraryDataCacheWithTemplate(undefined, 100, config);

      const uncachedResult = await cache.getCacheEntry("library");
      expect(uncachedResult.registryEntry).toBeUndefined();
      expect(uncachedResult.authDocument).toEqual({
        links: [],
        title: "title"
      });
      expect(fetchMock.called()).toBe(false);
      expect(getCatalog).toHaveBeenCalledTimes(1);
      expect(getAuthDocument).toHaveBeenCalledTimes(1);

      // Now the entry is in the cache so fetch won't be called.
      const cachedResult = await cache.getCacheEntry("library");
      expect(fetchMock.called()).toBe(false);
      expect(uncachedResult.registryEntry).toBeUndefined();
      expect(cachedResult.authDocument).toEqual({
        links: [],
        title: "title"
      });
    });

    test("fetches an entry from the registry if it's in the cache but expired", async () => {
      const cache = new LibraryDataCacheWithTemplate("base-url", 1);

      fetchMock.mock("/library/uuid", {
        status: 200,
        body: { catalogs: [registryEntry] }
      });
      const fetchArgs = fetchMock.calls();

      const uncachedResult = await cache.getCacheEntry("uuid");
      expect(uncachedResult.registryEntry).toEqual(registryEntry);
      expect(uncachedResult.authDocument).toEqual({
        links: [],
        title: "title"
      });
      expect(fetchArgs.length).toBe(1);
      expect(fetchArgs[0][0]).toBe("/library/uuid");
      expect(getAuthDocument).toHaveBeenCalledTimes(1);

      // Now the entry is in the cache, but if we wait more than 1 second
      // it will be expired.
      await new Promise<void>(resolve => setTimeout(resolve, 1001));
      const cacheExpiredResult = await cache.getCacheEntry("uuid");
      expect(cacheExpiredResult.registryEntry).toEqual(registryEntry);
      expect(cacheExpiredResult.authDocument).toEqual({
        links: [],
        title: "title"
      });
      expect(fetchArgs.length).toBe(2);
      expect(fetchArgs[1][0]).toBe("/library/uuid");
      expect(getAuthDocument).toHaveBeenCalledTimes(2);
    });

    test("fetches an entry from the config file if it's in the cache but expired", async () => {
      const config = { library: "http://libraryfromconfig.org" };
      const cache = new LibraryDataCacheWithTemplate(undefined, 1, config);

      const uncachedResult = await cache.getCacheEntry("library");
      expect(uncachedResult.registryEntry).toBeUndefined();
      expect(uncachedResult.authDocument).toEqual({
        links: [],
        title: "title"
      });
      expect(fetchMock.called()).toBe(false);
      expect(getCatalog).toHaveBeenCalledTimes(1);
      expect(getAuthDocument).toHaveBeenCalledTimes(1);

      // Now the entry is in the cache, but if we wait more than 1 second
      // it will be expired.
      await new Promise<void>(resolve => setTimeout(resolve, 1001));
      const cacheExpiredResult = await cache.getCacheEntry("library");
      expect(cacheExpiredResult.registryEntry).toBeUndefined();
      expect(cacheExpiredResult.authDocument).toEqual({
        links: [],
        title: "title"
      });
      expect(fetchMock.called()).toBe(false);
      expect(getCatalog).toHaveBeenCalledTimes(2);
      expect(getAuthDocument).toHaveBeenCalledTimes(2);
    });

    test("ignores errors fetching the auth document", async () => {
      const cache = new LibraryDataCacheWithTemplate("base-url");
      getAuthDocument.mockRejectedValue();

      fetchMock.mock("/library/uuid", {
        status: 200,
        body: { catalogs: [registryEntry] }
      });
      const fetchArgs = fetchMock.calls();

      const uncachedResult = await cache.getCacheEntry("uuid");
      expect(uncachedResult.registryEntry).toEqual(registryEntry);
      expect(uncachedResult.authDocument).toBeUndefined();
      expect(fetchMock.called()).toBe(true);
      expect(fetchArgs[0][0]).toBe("/library/uuid");
      // "getAuthDocument call count"
      expect(getAuthDocument).toHaveBeenCalledTimes(1);
    });

    test("throws an error if there's an error fetching the catalog", async () => {
      const cache = new LibraryDataCacheWithTemplate("/base-url");
      getCatalog.mockRejectedValue();

      jest.fn().mockResolvedValue({
        json: () => {
          return { catalogs: [registryEntry] };
        }
      });

      fetchMock.mock("/library/uuid", {
        status: 200,
        body: { catalogs: [registryEntry] }
      });

      await expect(
        cache.getCacheEntry("uuid")
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"This library is not available."`
      );
      expect(fetchMock.called()).toBe(true);
      expect(getCatalog).toHaveBeenCalledTimes(1);
    });

    test("throws an error if the registry response doesn't have a library catalog.", async () => {
      const cache = new LibraryDataCacheWithTemplate("/base-url");

      fetchMock.mock("/base-url", 200);
      fetchMock.mock("/library/uuid", { status: 200, body: { catalogs: [] } });

      await expect(
        cache.getCacheEntry("uuid")
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"This library is not available."`
      );
      expect(fetchMock.called()).toBe(true);
    });

    test("throws an error if the registry returns a problem detail", async () => {
      const cache = new LibraryDataCacheWithTemplate("base url");
      fetchMock.mock("/base-url", 200);
      fetchMock.mock("/library/uuid", () => {
        throw "some problem detail";
      });

      await expect(
        cache.getCacheEntry("uuid")
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"This library is not available."`
      );
      expect(fetchMock.called()).toBe(true);
    });

    test("returns an error if the registry entry doesn't have a catalog url", async () => {
      const registryEntryWithoutCatalog = { ...registryEntry, links: [] };
      const cache = new LibraryDataCacheWithTemplate("base-url");

      fetchMock.mock("/base-url", 200);
      fetchMock.mock("/library/uuid", {
        status: 200,
        body: { catalogs: [registryEntryWithoutCatalog] }
      });

      await expect(
        cache.getCacheEntry("uuid")
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Registry entry does not have a catalog URL"`
      );
      expect(fetchMock.called()).toBe(true);
    });

    test("throws an error if the config file doesn't have an entry for the library", async () => {
      const config = { library: "http://libraryfromconfig.org" };
      const cache = new LibraryDataCacheWithTemplate(undefined, 10, config);

      await expect(
        cache.getCacheEntry("uuid")
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"No catalog is configured for library uuid"`
      );
    });
  });

  describe("getRegistryEntry", () => {
    // Create a mock cache class that already has a url template.
    class LibraryDataCacheWithTemplate extends LibraryDataCache {
      protected libraryUrlTemplate = "/library/{uuid}";
    }
    const cache = new LibraryDataCacheWithTemplate("base-url");
    const registryEntry = {
      links: [
        {
          href: "http://library.org/catalog",
          rel: "http://opds-spec.org/catalog"
        }
      ],
      metadata: {
        updated: "20180901",
        id: "uuid",
        title: "the library"
      }
    };

    test("fetches a registry entry", async () => {
      const registryResponse = {
        catalogs: [registryEntry]
      };

      const mockFetch = jest.fn();
      mockFetch.mockResolvedValue({ json: () => registryResponse });

      fetchMock.mock("/library/uuid", { status: 200, body: registryResponse });

      const fetchArgs = fetchMock.calls();

      const result = await cache.getRegistryEntry("uuid");
      expect(result).toEqual(registryEntry);
      expect(fetchMock.called()).toBe(true);
      expect(fetchArgs[0][0]).toBe("/library/uuid");
    });

    test("throws an error if the registry returns the wrong number of catalogs", async () => {
      const catalogsLists = [[], [registryEntry, registryEntry]];
      for (const catalogs of catalogsLists) {
        const registryResponse = {
          catalogs: catalogs
        };

        fetchMock.mock("/library/uuid", {
          status: 200,
          body: registryResponse
        });
        await expect(
          cache.getCacheEntry("uuid")
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"This library is not available."`
        );

        fetchMock.restore();
      }
    });
  });

  describe("getCatalog", () => {
    const cache = new LibraryDataCache("base-url");
    const opdsFeed = `<feed xmlns:app="http://www.w3.org/2007/app" xmlns:bib="http://bib.schema.org/" xmlns:bibframe="http://bibframe.org/vocab/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:drm="http://librarysimplified.org/terms/drm" xmlns:opds="http://opds-spec.org/2010/catalog" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:schema="http://schema.org/" xmlns:simplified="http://librarysimplified.org/terms/" xmlns="http://www.w3.org/2005/Atom" simplified:entryPoint="http://schema.org/EBook">
      <id>http://library.org/catalog</id>
      <title>Library</title>
      <link href="http://library.org/authentication_document" rel="http://opds-spec.org/auth/document"/>
      </feed>`;

    test("fetches a catalog", async () => {
      fetchMock.mock("/base-url", 200);
      fetchMock.mock("http://library.org/catalog", {
        status: 200,
        body: opdsFeed
      });
      const fetchArgs = fetchMock.calls();

      const result = await cache.getCatalog("http://library.org/catalog");
      expect(result.id).toBe("http://library.org/catalog");
      expect(result.title).toBe("Library");
      expect(result.links.length).toBe(1);
      expect(result.links[0].rel).toBe("http://opds-spec.org/auth/document");
      expect(result.links[0].href).toBe(
        "http://library.org/authentication_document"
      );
      expect(fetchMock.called()).toBe(true);
      expect(fetchArgs[0][0]).toBe("http://library.org/catalog");
    });

    test("returns an error if it can't fetch the catalog", async () => {
      fetchMock.mock("http://library.org/catalog", () => Promise.reject(""));

      await expect(
        cache.getCatalog("http://library.org/catalog")
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Could not get OPDS catalog at http://library.org/catalog"`
      );
      expect(fetchMock.called()).toBe(true);
    });

    test("returns an error if fetching the catalog does not return an OPDS feed", async () => {
      fetchMock.mock("http://library.org/catalog", {
        status: 200,
        body: "not OPDS"
      });
      await expect(
        cache.getCatalog("http://library.org/catalog")
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Could not get OPDS catalog at http://library.org/catalog"`
      );
      expect(fetchMock.called()).toBe(true);
    });
  });

  describe("getAuthDocument", () => {
    const cache = new LibraryDataCache("base-url");
    const feed = new OPDSFeed({
      id: "1",
      title: "Library",
      updated: "20180102",
      entries: [],
      links: [
        {
          rel: "related",
          href: "http://library.org/1.html",
          type: "text/html",
          title: "One",
          role: "navigation"
        },
        {
          rel: "related",
          href: "http://library.org/2.html",
          type: "text/html",
          title: "Two",
          role: "navigation"
        },
        {
          rel: "http://opds-spec.org/auth/document",
          href: "http://library.org/authentication_document",
          type: "application/json",
          title: "Auth",
          role: ""
        }
      ],
      complete: true,
      search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
      unparsed: {}
    });
    const authDoc = {
      title: "title",
      links: []
    };

    test("fetches an auth document", async () => {
      fetchMock.mock("http://library.org/authentication_document", {
        status: 200,
        body: authDoc
      });
      const fetchArgs = fetchMock.calls();

      const result = await cache.getAuthDocument(feed);
      expect(result).toEqual(authDoc);
      expect(fetchMock.called()).toBe(true);
      expect(fetchArgs[0][0]).toBe(
        "http://library.org/authentication_document"
      );
    });

    test("returns an error if the catalog does not have an auth document url", async () => {
      const feedWithoutAuthDoc = new OPDSFeed({
        id: "1",
        title: "Library",
        updated: "20180102",
        entries: [],
        links: [],
        complete: true,
        search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
        unparsed: {}
      });

      await expect(
        cache.getAuthDocument(feedWithoutAuthDoc)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Could not find authentication document in OPDS catalog"`
      );
    });

    test("returns an error if it can't fetch the auth document", async () => {
      fetchMock.mock("http://library.org/authentication_document", () =>
        Promise.reject("")
      );

      await expect(
        cache.getAuthDocument(feed)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Could not get authentication document at http://library.org/authentication_document"`
      );
      expect(fetchMock.called()).toBe(true);
    });
  });
});
