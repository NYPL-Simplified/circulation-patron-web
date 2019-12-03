import { expect } from "chai";

import computeBreadcrumbs from "../computeBreadcrumbs";

describe("computeBreadcrumbs", () => {
  let collection = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    books: [],
    navigationLinks: []
  };
  let history = [];

  it("uses breadcrumbs if they're in the raw collection data", () => {
    let raw = {
      "simplified:breadcrumbs": [
        {
          link: [
            {
              $: {
                href: { value: "breadcrumb url" },
                title: { value: "breadcrumb title" }
              }
            }
          ]
        }
      ]
    };
    let data = Object.assign({}, collection, { raw });
    let expected = [
      { url: "breadcrumb url", text: "breadcrumb title" },
      { url: collection.url, text: collection.title }
    ];
    expect(computeBreadcrumbs(data, history)).to.deep.equal(expected);
  });

  it("ignores trailing slashes when using hierarchyComputeBreadcrumbs", () => {
    let catalogRootLink = {
      url: "url/",
      text: "text"
    };

    let data = Object.assign({}, collection, { catalogRootLink });
    let expected = [{ url: collection.url, text: collection.title }];
    expect(computeBreadcrumbs(data, history)).to.deep.equal(expected);

    catalogRootLink = {
      url: "different url/",
      text: "text"
    };

    data = Object.assign({}, collection, { catalogRootLink });
    expected = [
      catalogRootLink,
      { url: collection.url, text: collection.title }
    ];
    expect(computeBreadcrumbs(data, history)).to.deep.equal(expected);
  });
});
