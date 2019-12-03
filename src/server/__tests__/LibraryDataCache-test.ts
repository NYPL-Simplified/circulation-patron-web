import { expect } from "chai";
import { stub } from "sinon";
const fetchMock = require("fetch-mock");

import LibraryDataCache, {
  RegistryEntry,
  AuthDocument,
  CacheEntry
} from "../LibraryDataCache";
import { OPDSFeed } from "opds-feed-parser";

describe("LibraryDataCache", () => {
  let config = {
    a: "http://a",
    b: "http://b"
  };

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
    let feed = new OPDSFeed({
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
          role: null
        }
      ],
      complete: true,
      search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
      unparsed: {}
    });
    getCatalog = stub().returns(
      new Promise<OPDSFeed>(resolve => resolve(feed))
    );
    getAuthDocument = stub().returns(
      new Promise<AuthDocument>(resolve =>
        resolve({ links: [], title: "title" })
      )
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  describe("getLibraryUrlTemplate", () => {
    it("fetches registry base url to get url template", async () => {
      let cache = new LibraryDataCache("base-url");
      let template = "/library/{uuid}";
      let registryCatalog = {
        links: [
          {
            rel: "http://librarysimplified.org/rel/registry/library",
            href: template
          }
        ]
      };

      fetchMock.mock("/base-url", { status: 200, body: registryCatalog });
      let fetchArgs = fetchMock.calls();

      let uncachedResult = await cache.getLibraryUrlTemplate();
      expect(uncachedResult).to.equal(template);
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs.length).to.equal(1);
      expect(fetchArgs[0][0]).to.equal("/base-url");

      // Now the template is cached so fetch won't be called again.
      let cachedResult = await cache.getLibraryUrlTemplate();
      expect(cachedResult).to.equal(template);
      expect(fetchArgs.length).to.equal(1);
    });

    it("throws an error if the registry returns an error", async () => {
      let cache = new LibraryDataCache("base-url");
      fetchMock.mock("/base-url", 400);

      try {
        // This should raise an error since the registry response was an error.
        let result = await cache.getLibraryUrlTemplate();
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("Library registry is not available");
        expect(fetchMock.called()).to.equal(true);
      }
    });
  });

  describe("getDataFromAuthDocumentAndCatalog", () => {
    let authDocument = {
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

    let feed = new OPDSFeed({
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
          role: null
        }
      ],
      complete: true,
      search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
      unparsed: {}
    });

    it("returns data", () => {
      let cache = new LibraryDataCache("base-url");
      let data = cache.getDataFromAuthDocumentAndCatalog(authDocument, feed);
      expect(data.catalogName).to.equal("title");
      expect(data.logoUrl).to.equal("http://library.org/logo");
      expect(data.cssLinks).to.deep.equal([
        authDocument.links[1],
        authDocument.links[2]
      ]);
      expect(data.colors).to.deep.equal(authDocument.web_color_scheme);
      expect(data.headerLinks).to.deep.equal([feed.links[0], feed.links[1]]);
    });
  });

  describe("getLibraryData", () => {
    let cacheEntry = {
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
            role: null
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
      getCacheEntry = stub().returns(
        new Promise(resolve => resolve(cacheEntry))
      );
    });

    it("converts cache entry from registry to library data", async () => {
      let cache = new LibraryDataCacheWithEntry("base-url");
      let libraryData = await cache.getLibraryData("uuid");

      expect(libraryData.id).to.equal("uuid");
      expect(libraryData.catalogUrl).to.equal("http://library.org/catalog");
      expect(libraryData.catalogName).to.equal(
        "the library in the auth document"
      );
      expect(libraryData.logoUrl).to.equal("http://library.org/logo");
      expect(libraryData.onlyLibrary).to.be.undefined;
      expect(libraryData.colors.background).to.equal("#000000");
      expect(libraryData.colors.foreground).to.equal("#ffffff");
      expect(libraryData.headerLinks).to.deep.equal([
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

    it("converts cache entry from config to library data", async () => {
      cacheEntry.registryEntry = null;
      let config = { library: "http://libraryfromconfig.org" };
      let cache = new LibraryDataCacheWithEntry(null, 100, config);
      let libraryData = await cache.getLibraryData("library");
      expect(libraryData.id).to.equal("library");
      expect(libraryData.catalogUrl).to.equal("http://libraryfromconfig.org");
      expect(libraryData.catalogName).to.equal(
        "the library in the auth document"
      );
      expect(libraryData.logoUrl).to.equal("http://library.org/logo");
      expect(libraryData.onlyLibrary).to.be.undefined;
      expect(libraryData.colors.background).to.equal("#000000");
      expect(libraryData.colors.foreground).to.equal("#ffffff");
      expect(libraryData.headerLinks).to.deep.equal([
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
    let registryEntry = {
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

    it("fetches an entry from the registry if it's not in the cache", async () => {
      let cache = new LibraryDataCacheWithTemplate("base-url");

      // What gets called in `getRegistryEntry`
      fetchMock.mock("/library/uuid", {
        status: 200,
        body: { catalogs: [registryEntry] }
      });
      let fetchArgs = fetchMock.calls();

      let uncachedResult = await cache.getCacheEntry("uuid");
      expect(uncachedResult.registryEntry).to.deep.equal(registryEntry);
      expect(uncachedResult.authDocument).to.deep.equal({
        links: [],
        title: "title"
      });
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs.length).to.equal(1);
      expect(fetchArgs[0][0]).to.equal("/library/uuid");
      expect(getCatalog.callCount).to.equal(1);
      expect(getAuthDocument.callCount).to.equal(1);

      // Now the entry is in the cache so fetch won't be called again.
      let cachedResult = await cache.getCacheEntry("uuid");
      expect(fetchArgs.length).to.equal(1);
      expect(cachedResult.registryEntry).to.deep.equal(registryEntry);
      expect(cachedResult.authDocument).to.deep.equal({
        links: [],
        title: "title"
      });
    });

    it("fetches an entry from the config file if it's not in the cache", async () => {
      let config = { library: "http://libraryfromconfig.org" };
      let cache = new LibraryDataCacheWithTemplate(null, 100, config);

      let uncachedResult = await cache.getCacheEntry("library");
      expect(uncachedResult.registryEntry).to.be.undefined;
      expect(uncachedResult.authDocument).to.deep.equal({
        links: [],
        title: "title"
      });
      expect(fetchMock.called()).to.equal(false);
      expect(getCatalog.callCount).to.equal(1);
      expect(getAuthDocument.callCount).to.equal(1);

      // Now the entry is in the cache so fetch won't be called.
      let cachedResult = await cache.getCacheEntry("library");
      expect(fetchMock.called()).to.equal(false);
      expect(uncachedResult.registryEntry).to.be.undefined;
      expect(cachedResult.authDocument).to.deep.equal({
        links: [],
        title: "title"
      });
    });

    it("fetches an entry from the registry if it's in the cache but expired", async () => {
      let cache = new LibraryDataCacheWithTemplate("base-url", 1);

      fetchMock.mock("/library/uuid", {
        status: 200,
        body: { catalogs: [registryEntry] }
      });
      let fetchArgs = fetchMock.calls();

      let uncachedResult = await cache.getCacheEntry("uuid");
      expect(uncachedResult.registryEntry).to.deep.equal(registryEntry);
      expect(uncachedResult.authDocument).to.deep.equal({
        links: [],
        title: "title"
      });
      expect(fetchArgs.length).to.equal(1);
      expect(fetchArgs[0][0]).to.equal("/library/uuid");
      expect(getAuthDocument.callCount).to.equal(1);

      // Now the entry is in the cache, but if we wait more than 1 second
      // it will be expired.
      await new Promise<void>(resolve => setTimeout(resolve, 1001));
      let cacheExpiredResult = await cache.getCacheEntry("uuid");
      expect(cacheExpiredResult.registryEntry).to.deep.equal(registryEntry);
      expect(cacheExpiredResult.authDocument).to.deep.equal({
        links: [],
        title: "title"
      });
      expect(fetchArgs.length).to.equal(2);
      expect(fetchArgs[1][0]).to.equal("/library/uuid");
      expect(getAuthDocument.callCount).to.equal(2);
    });

    it("fetches an entry from the config file if it's in the cache but expired", async () => {
      let config = { library: "http://libraryfromconfig.org" };
      let cache = new LibraryDataCacheWithTemplate(null, 1, config);

      let uncachedResult = await cache.getCacheEntry("library");
      expect(uncachedResult.registryEntry).to.be.undefined;
      expect(uncachedResult.authDocument).to.deep.equal({
        links: [],
        title: "title"
      });
      expect(fetchMock.called()).to.equal(false);
      expect(getCatalog.callCount).to.equal(1);
      expect(getAuthDocument.callCount).to.equal(1);

      // Now the entry is in the cache, but if we wait more than 1 second
      // it will be expired.
      await new Promise<void>(resolve => setTimeout(resolve, 1001));
      let cacheExpiredResult = await cache.getCacheEntry("library");
      expect(cacheExpiredResult.registryEntry).to.be.undefined;
      expect(cacheExpiredResult.authDocument).to.deep.equal({
        links: [],
        title: "title"
      });
      expect(fetchMock.called()).to.equal(false);
      expect(getCatalog.callCount).to.equal(2);
      expect(getAuthDocument.callCount).to.equal(2);
    });

    it("ignores errors fetching the auth document", async () => {
      let cache = new LibraryDataCacheWithTemplate("base-url");
      getAuthDocument.returns(
        new Promise<AuthDocument>((resolve, reject) => reject())
      );

      fetchMock.mock("/library/uuid", {
        status: 200,
        body: { catalogs: [registryEntry] }
      });
      let fetchArgs = fetchMock.calls();

      let uncachedResult = await cache.getCacheEntry("uuid");
      expect(uncachedResult.registryEntry).to.deep.equal(registryEntry);
      expect(uncachedResult.authDocument).to.be.undefined;
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal("/library/uuid");
      expect(getAuthDocument.callCount, "getAuthDocument call count").to.equal(
        1
      );
    });

    it("throws an error if there's an error fetching the catalog", async () => {
      let cache = new LibraryDataCacheWithTemplate("/base-url");
      getCatalog.returns(
        new Promise<OPDSFeed>((resolve, reject) => reject())
      );

      let mockFetch = stub().returns(
        new Promise<any>(resolve => {
          resolve({
            json: () => {
              return { catalogs: [registryEntry] };
            }
          });
        })
      );

      fetchMock.mock("/library/uuid", {
        status: 200,
        body: { catalogs: [registryEntry] }
      });

      try {
        let result = await cache.getCacheEntry("uuid");
        // Fail the test if it's successful
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("This library is not available");
        expect(fetchMock.called()).to.equal(true);
        expect(getCatalog.callCount).to.equal(1);
      }
    });

    it("throws an error if the registry response doesn't have a library catalog.", async () => {
      let cache = new LibraryDataCacheWithTemplate("/base-url");

      fetchMock.mock("/base-url", 200);
      fetchMock.mock("/library/uuid", { status: 200, body: { catalogs: [] } });

      try {
        // This should raise an error since the registry response does not have a catalog.
        let result = await cache.getCacheEntry("uuid");
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("This library is not available");
        expect(fetchMock.called()).to.equal(true);
      }
    });

    it("throws an error if the registry returns a problem detail", async () => {
      let cache = new LibraryDataCacheWithTemplate("base url");
      fetchMock.mock("/base-url", 200);
      fetchMock.mock("/library/uuid", () => {
        throw "some problem detail";
      });

      try {
        // This should raise an error since the registry response was an error.
        let result = await cache.getCacheEntry("uuid");
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("This library is not available");
        expect(fetchMock.called()).to.equal(true);
      }
    });

    it("returns an error if the registry entry doesn't have a catalog url", async () => {
      let registryEntryWithoutCatalog = { ...registryEntry, links: [] };
      let cache = new LibraryDataCacheWithTemplate("base-url");

      fetchMock.mock("/base-url", 200);
      fetchMock.mock("/library/uuid", {
        status: 200,
        body: { catalogs: [registryEntryWithoutCatalog] }
      });

      try {
        // This should raise an error.
        let result = await cache.getCacheEntry("uuid");
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("Registry entry does not have a catalog URL");
      }
    });

    it("throws an error if the config file doesn't have an entry for the library", async () => {
      let config = { library: "http://libraryfromconfig.org" };
      let cache = new LibraryDataCacheWithTemplate(null, 10, config);

      try {
        // This should raise an error since the library is not in the config.
        let result = await cache.getCacheEntry("otherlibrary");
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("No catalog is configured");
      }
    });
  });

  describe("getRegistryEntry", () => {
    // Create a mock cache class that already has a url template.
    class LibraryDataCacheWithTemplate extends LibraryDataCache {
      protected libraryUrlTemplate = "/library/{uuid}";
    }
    let cache = new LibraryDataCacheWithTemplate("base-url");
    let registryEntry = {
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

    it("fetches a registry entry", async () => {
      let registryResponse = {
        catalogs: [registryEntry]
      };

      let mockFetch = stub();
      mockFetch.returns(
        new Promise<any>(resolve => {
          resolve({ json: () => registryResponse });
        })
      );

      fetchMock.mock("/library/uuid", { status: 200, body: registryResponse });

      let fetchArgs = fetchMock.calls();

      let result = await cache.getRegistryEntry("uuid");
      expect(result).to.deep.equal(registryEntry);
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal("/library/uuid");
    });

    it("throws an error if the registry returns the wrong number of catalogs", async () => {
      let catalogsLists = [[], [registryEntry, registryEntry]];
      for (let catalogs of catalogsLists) {
        let registryResponse = {
          catalogs: catalogs
        };

        fetchMock.mock("/library/uuid", {
          status: 200,
          body: registryResponse
        });

        try {
          // This should raise an error.
          let result = await cache.getRegistryEntry("uuid");
          // Fail the test if it's successful.
          expect(true, "no error was raised").to.equal(false);
        } catch (error) {
          expect(error).to.contain("This library is not available");
        }

        fetchMock.restore();
      }
    });
  });

  describe("getCatalog", () => {
    let cache = new LibraryDataCache("base-url");
    let opdsFeed = `<feed xmlns:app="http://www.w3.org/2007/app" xmlns:bib="http://bib.schema.org/" xmlns:bibframe="http://bibframe.org/vocab/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:drm="http://librarysimplified.org/terms/drm" xmlns:opds="http://opds-spec.org/2010/catalog" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:schema="http://schema.org/" xmlns:simplified="http://librarysimplified.org/terms/" xmlns="http://www.w3.org/2005/Atom" simplified:entryPoint="http://schema.org/EBook">
      <id>http://library.org/catalog</id>
      <title>Library</title>
      <link href="http://library.org/authentication_document" rel="http://opds-spec.org/auth/document"/>
      </feed>`;

    it("fetches a catalog", async () => {
      fetchMock.mock("/base-url", 200);
      fetchMock.mock("http://library.org/catalog", {
        status: 200,
        body: opdsFeed
      });
      let fetchArgs = fetchMock.calls();

      let result = await cache.getCatalog("http://library.org/catalog");
      expect(result.id).to.equal("http://library.org/catalog");
      expect(result.title).to.equal("Library");
      expect(result.links.length).to.equal(1);
      expect(result.links[0].rel).to.equal(
        "http://opds-spec.org/auth/document"
      );
      expect(result.links[0].href).to.equal(
        "http://library.org/authentication_document"
      );
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal("http://library.org/catalog");
    });

    it("returns an error if it can't fetch the catalog", async () => {
      fetchMock.mock("http://library.org/catalog", () => Promise.reject(""));

      try {
        // This should raise an error.
        let result = await cache.getCatalog("http://library.org/catalog");
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("Could not get OPDS catalog");
        expect(fetchMock.called()).to.equal(true);
      }
    });

    it("returns an error if fetching the catalog does not return an OPDS feed", async () => {
      fetchMock.mock("http://library.org/catalog", {
        status: 200,
        body: "not OPDS"
      });
      try {
        // This should raise an error.
        let result = await cache.getCatalog("http://library.org/catalog");
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("Could not get OPDS catalog");
        expect(fetchMock.called()).to.equal(true);
      }
    });
  });

  describe("getAuthDocument", () => {
    let cache = new LibraryDataCache("base-url");
    let feed = new OPDSFeed({
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
          role: null
        }
      ],
      complete: true,
      search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
      unparsed: {}
    });
    let authDoc = {
      title: "title",
      links: []
    };

    it("fetches an auth document", async () => {
      fetchMock.mock("http://library.org/authentication_document", {
        status: 200,
        body: authDoc
      });
      let fetchArgs = fetchMock.calls();

      let result = await cache.getAuthDocument(feed);
      expect(result).to.deep.equal(authDoc);
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(
        "http://library.org/authentication_document"
      );
    });

    it("returns an error if the catalog does not have an auth document url", async () => {
      let mockFetch = stub();
      let feedWithoutAuthDoc = new OPDSFeed({
        id: "1",
        title: "Library",
        updated: "20180102",
        entries: [],
        links: [],
        complete: true,
        search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
        unparsed: {}
      });

      try {
        // This should raise an error.
        let result = await cache.getAuthDocument(feedWithoutAuthDoc);
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("Could not find authentication document");
      }
    });

    it("returns an error if it can't fetch the auth document", async () => {
      fetchMock.mock("http://library.org/authentication_document", () =>
        Promise.reject("")
      );

      try {
        // This should raise an error.
        let result = await cache.getAuthDocument(feed);
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("Could not get authentication document");
        expect(fetchMock.called()).to.equal(true);
      }
    });
  });
});
