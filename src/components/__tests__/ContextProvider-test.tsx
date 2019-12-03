import * as React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";

import ContextProvider from "../ContextProvider";
import buildStore from "opds-web-client/lib/store";

class TestComponent extends React.Component<any, any> {}

describe("ContextProvider", () => {
  let wrapper;
  let store;
  const library = {
    id: "TEST",
    catalogUrl: "http://example.com/home",
    catalogName: "Example"
  };

  beforeEach(() => {
    store = buildStore();
    wrapper = shallow(
      <ContextProvider library={library} initialState={store.getState()}>
        <TestComponent />
      </ContextProvider>
    );
  });

  it("provides child context", () => {
    const context = wrapper.instance().getChildContext();
    expect(context.pathFor).to.equal(wrapper.instance().pathFor);
    expect(context.library).to.equal(library);
    expect(context.initialState).to.equal(store.getState());
  });

  it("renders child", () => {
    const children = wrapper.find(TestComponent);
    expect(children.length).to.equal(1);
  });

  describe("pathFor", () => {
    const collectionUrl = "collection/url";
    const bookUrl = "book/url";
    const host = "http://example.com";

    beforeEach(() => {
      wrapper = shallow(
        <ContextProvider
          library={library}
          shortenUrls={false}
          initialState={store.getState()}
        >
          <TestComponent />
        </ContextProvider>
      );
    });

    it("returns a path with collection and book", () => {
      const instance = wrapper.instance();
      const path = instance.pathFor(collectionUrl, bookUrl);
      expect(path).to.equal(
        `/TEST/collection/${instance.urlShortener.prepareCollectionUrl(
          collectionUrl
        )}` + `/book/${instance.urlShortener.prepareBookUrl(bookUrl)}`
      );
    });

    it("returns a path with only collection", () => {
      const instance = wrapper.instance();
      const path = instance.pathFor(collectionUrl, null);
      expect(path).to.equal(
        `/TEST/collection/${instance.urlShortener.prepareCollectionUrl(
          collectionUrl
        )}`
      );
    });

    it("returns a path with only book", () => {
      const instance = wrapper.instance();
      const path = instance.pathFor(null, bookUrl);
      expect(path).to.equal(
        `/TEST/book/${instance.urlShortener.prepareBookUrl(bookUrl)}`
      );
    });

    it("returns a path with no collection or book", () => {
      const path = wrapper.instance().pathFor(null, null);
      expect(path).to.equal(`/TEST`);
    });

    it("returns a path with no collection or book and no library id", () => {
      const library = {
        id: null,
        catalogUrl: "http://example.com/home",
        catalogName: "Example"
      };
      wrapper = shallow(
        <ContextProvider
          library={library}
          shortenUrls={false}
          initialState={store.getState()}
        >
          <TestComponent />
        </ContextProvider>
      );
      const path = wrapper.instance().pathFor(null, null);
      expect(path).to.equal(`/`);
    });
  });
});
