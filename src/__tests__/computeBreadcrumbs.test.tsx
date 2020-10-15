import computeBreadcrumbs from "../computeBreadcrumbs";

describe("computeBreadcrumbs", () => {
  const collection = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    books: [],
    navigationLinks: []
  };

  test("uses breadcrumbs if they're in the raw collection data", () => {
    const raw = {
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
    const data = Object.assign({}, collection, { raw });
    const expected = [
      { url: "breadcrumb url", text: "breadcrumb title" },
      { url: collection.url, text: collection.title }
    ];
    expect(computeBreadcrumbs(data)).toEqual(expected);
  });

  test("ignores trailing slashes when using hierarchyComputeBreadcrumbs", () => {
    let catalogRootLink = {
      url: "url/",
      text: "text"
    };

    let data = Object.assign({}, collection, { catalogRootLink });
    let expected = [{ url: collection.url, text: collection.title }];
    expect(computeBreadcrumbs(data)).toEqual(expected);

    catalogRootLink = {
      url: "different url/",
      text: "text"
    };

    data = Object.assign({}, collection, { catalogRootLink });
    expected = [
      catalogRootLink,
      { url: collection.url, text: collection.title }
    ];
    expect(computeBreadcrumbs(data)).toEqual(expected);
  });
});
