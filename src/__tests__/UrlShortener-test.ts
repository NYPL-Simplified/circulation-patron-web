import { expect } from "chai";

import UrlShortener from "../UrlShortener";

describe("UrlShortener", () => {
  const host = "http://example.com/library/";
  const collectionUrl = "collection/url";
  const bookUrl = "book/url";

  describe("with shortening disabled", () => {
    const shortener = new UrlShortener(host, false);

    it("prepares collection url", () => {
      const url = host + collectionUrl;
      expect(shortener.prepareCollectionUrl(url)).to.equal(
        "http%3A%2F%2Fexample.com%2Flibrary%2Fcollection%2Furl"
      );
    });

    it("prepares book url", () => {
      const url = host + bookUrl;
      expect(shortener.prepareBookUrl(url)).to.equal(
        "http%3A%2F%2Fexample.com%2Flibrary%2Fbook%2Furl"
      );
    });

    it("expands collection url", () => {
      const url = host + collectionUrl;
      expect(shortener.expandCollectionUrl(url)).to.equal(url);
    });

    it("expands book url", () => {
      const url = host + "works/" + bookUrl;
      expect(shortener.expandBookUrl(url)).to.equal(url);
    });
  });

  describe("with shortening enabled", () => {
    const shortener = new UrlShortener(host, true);

    it("prepares collection url", () => {
      const url = host + collectionUrl;
      expect(shortener.prepareCollectionUrl(url)).to.equal("collection%2Furl");
    });

    it("prepares book url", () => {
      let url = host + "works/" + bookUrl;
      expect(shortener.prepareBookUrl(url)).to.equal("book%2Furl");
      // it preserves trailing slashes
      url += "/";
      expect(shortener.prepareBookUrl(url)).to.equal("book%2Furl%2F");
      // but not starting slashes
      url = "/" + url;
      expect(shortener.prepareBookUrl(url)).to.equal("book%2Furl%2F");
    });

    it("expands collection url", () => {
      const url = host + collectionUrl;
      expect(shortener.expandCollectionUrl(collectionUrl)).to.equal(url);
    });

    it("expands book url", () => {
      const url = host + "works/" + bookUrl;
      expect(shortener.expandBookUrl(bookUrl)).to.equal(url);
    });
  });
});
