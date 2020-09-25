import { RecommendationsState } from "../../interfaces";

export const emptyRecommendationsState: RecommendationsState = {
  isFetching: false,
  isFetchingPage: false,
  url: "/recommmendation-url",
  error: null,
  history: [],
  data: null
};
/**
 * This huge fixture was copied over from the recommendationsState
 * fetched when viewing "Emma" by Jane Austen.
 * I stripped out the $raw property to reduce this file size
 * I also stripped the raw property on books in lanes
 * http://localhost:3000/book/URI%2Fhttps%3A%2F%2Fstandardebooks.org%2Febooks%2Fjane-austen%2Femma
 */
export const recommendationsState: RecommendationsState = {
  isFetching: false,
  isFetchingPage: false,
  error: null,
  history: [
    {
      id: null,
      url: "http://test-cm.com/catalogUrl/groups/",
      text: "All Books",
      type: "start"
    }
  ],
  url: "http://related-url",
  data: {
    id:
      "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/emma/related_books?available=all&after=0&collection=main&entrypoint=Book&order=author&size=50",
    title: "Related Books",
    url: "http://data-related-url",
    lanes: [
      {
        title: "Jane Austen",
        url:
          "http://test-cm.com/catalogUrl/works/contributor/Jane%20Austen/eng/",
        books: [
          {
            id:
              "https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice",
            title: "Recommendation 1",
            series: undefined,
            authors: ["Jane Austen"],
            contributors: [],
            summary:
              "<p><i>Pride and Prejudice</i> may today be one of Jane Austen’s most enduring novels, having been widely adapted to stage, screen, and other media since its publication in 1813. The novel tells the tale of five unmarried sisters and how their lives change when a wealthy eligible bachelor moves in to their neighborhood.</p>\n\t\t\t<p>This edition removes Austen’s pathological use of period-dashes and many ungrammatical commas to make the reading smoother for modern readers.</p>",
            imageUrl:
              "https://s3.amazonaws.com/open-bookshelf-covers/scaled/300/Standard+Ebooks/URI/https%3A//standardebooks.org/ebooks/jane-austen/pride-and-prejudice/cover.png",
            openAccessLinks: [
              {
                url: "http://test-cm.com/catalogUrl/works/9/fulfill/2",
                type: "application/kepub+zip"
              },
              {
                url: "http://test-cm.com/catalogUrl/works/9/fulfill/2",
                type: "application/epub+zip"
              },
              {
                url: "http://test-cm.com/catalogUrl/works/9/fulfill/8",
                type: "application/kepub+zip"
              },
              {
                url: "http://test-cm.com/catalogUrl/works/9/fulfill/7",
                type: "application/x-mobi8-ebook"
              }
            ],
            borrowUrl:
              "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/borrow",
            fulfillmentLinks: [],
            availability: {
              status: "available"
            },
            holds: null,
            copies: null,
            publisher: "Standard Ebooks",
            published: "January 29, 1813",
            categories: [
              "Adult",
              "Fiction",
              "Classics",
              "Romance",
              "Historical Fiction"
            ],
            language: "en",
            url: "http://recommendation-1-url",
            raw: {
              $: {
                "schema:additionalType": {
                  name: "schema:additionalType",
                  value: "http://schema.org/EBook",
                  prefix: "schema",
                  local: "additionalType",
                  uri: "http://schema.org/"
                }
              },
              $ns: {
                uri: "http://www.w3.org/2005/Atom",
                local: "entry"
              },
              title: [
                {
                  _: "Pride and Prejudice",
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "title"
                  }
                }
              ],
              author: [
                {
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "author"
                  },
                  name: [
                    {
                      _: "Jane Austen",
                      $ns: {
                        uri: "http://www.w3.org/2005/Atom",
                        local: "name"
                      }
                    }
                  ],
                  link: [
                    {
                      $: {
                        href: {
                          name: "href",
                          value:
                            "http://test-cm.com/catalogUrl/works/contributor/Jane%20Austen/eng/Adult%2CAdults%2BOnly%2CChildren%2CYoung%2BAdult",
                          prefix: "",
                          local: "href",
                          uri: ""
                        },
                        type: {
                          name: "type",
                          value:
                            "application/atom+xml;profile=opds-catalog;kind=acquisition",
                          prefix: "",
                          local: "type",
                          uri: ""
                        },
                        rel: {
                          name: "rel",
                          value: "contributor",
                          prefix: "",
                          local: "rel",
                          uri: ""
                        },
                        title: {
                          name: "title",
                          value: "Jane Austen",
                          prefix: "",
                          local: "title",
                          uri: ""
                        }
                      },
                      $ns: {
                        uri: "http://www.w3.org/2005/Atom",
                        local: "link"
                      }
                    }
                  ]
                }
              ],
              summary: [
                {
                  _:
                    "<p><i>Pride and Prejudice</i> may today be one of Jane Austen’s most enduring novels, having been widely adapted to stage, screen, and other media since its publication in 1813. The novel tells the tale of five unmarried sisters and how their lives change when a wealthy eligible bachelor moves in to their neighborhood.</p>\n\t\t\t<p>This edition removes Austen’s pathological use of period-dashes and many ungrammatical commas to make the reading smoother for modern readers.</p>",
                  $: {
                    type: {
                      name: "type",
                      value: "html",
                      prefix: "",
                      local: "type",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "summary"
                  }
                }
              ],
              "simplified:pwid": [
                {
                  _: "b136eb5d-5be0-78f3-c3a6-0eab9eab0cb6",
                  $ns: {
                    uri: "http://librarysimplified.org/terms/",
                    local: "pwid"
                  }
                }
              ],
              link: [
                {
                  $: {
                    href: {
                      name: "href",
                      value:
                        "https://s3.amazonaws.com/open-bookshelf-covers/Standard+Ebooks/URI/https%3A//standardebooks.org/ebooks/jane-austen/pride-and-prejudice/cover.jpg",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    type: {
                      name: "type",
                      value: "image/jpeg",
                      prefix: "",
                      local: "type",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value: "http://opds-spec.org/image",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  }
                },
                {
                  $: {
                    href: {
                      name: "href",
                      value:
                        "https://s3.amazonaws.com/open-bookshelf-covers/scaled/300/Standard+Ebooks/URI/https%3A//standardebooks.org/ebooks/jane-austen/pride-and-prejudice/cover.png",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    type: {
                      name: "type",
                      value: "image/png",
                      prefix: "",
                      local: "type",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value: "http://opds-spec.org/image/thumbnail",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  }
                },
                {
                  $: {
                    href: {
                      name: "href",
                      value:
                        "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/report",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value: "issues",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  }
                },
                {
                  $: {
                    href: {
                      name: "href",
                      value:
                        "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    type: {
                      name: "type",
                      value:
                        "application/atom+xml;type=entry;profile=opds-catalog",
                      prefix: "",
                      local: "type",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value: "alternate",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  }
                },
                {
                  $: {
                    href: {
                      name: "href",
                      value:
                        "http://test-cm.com/catalogUrl/works/contributor/Jane%20Austen/eng/",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value: "collection",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    },
                    title: {
                      name: "title",
                      value: "Jane Austen",
                      prefix: "",
                      local: "title",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  }
                },
                {
                  $: {
                    href: {
                      name: "href",
                      value:
                        "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/borrow",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value: "http://opds-spec.org/acquisition/borrow",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    },
                    type: {
                      name: "type",
                      value:
                        "application/atom+xml;type=entry;profile=opds-catalog",
                      prefix: "",
                      local: "type",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  },
                  "opds:indirectAcquisition": [
                    {
                      $: {
                        type: {
                          name: "type",
                          value: "application/epub+zip",
                          prefix: "",
                          local: "type",
                          uri: ""
                        }
                      },
                      $ns: {
                        uri: "http://opds-spec.org/2010/catalog",
                        local: "indirectAcquisition"
                      }
                    },
                    {
                      $: {
                        type: {
                          name: "type",
                          value: "application/epub+zip",
                          prefix: "",
                          local: "type",
                          uri: ""
                        }
                      },
                      $ns: {
                        uri: "http://opds-spec.org/2010/catalog",
                        local: "indirectAcquisition"
                      }
                    },
                    {
                      $: {
                        type: {
                          name: "type",
                          value: "application/kepub+zip",
                          prefix: "",
                          local: "type",
                          uri: ""
                        }
                      },
                      $ns: {
                        uri: "http://opds-spec.org/2010/catalog",
                        local: "indirectAcquisition"
                      }
                    },
                    {
                      $: {
                        type: {
                          name: "type",
                          value: "application/x-mobi8-ebook",
                          prefix: "",
                          local: "type",
                          uri: ""
                        }
                      },
                      $ns: {
                        uri: "http://opds-spec.org/2010/catalog",
                        local: "indirectAcquisition"
                      }
                    }
                  ],
                  "opds:availability": [
                    {
                      $: {
                        status: {
                          name: "status",
                          value: "available",
                          prefix: "",
                          local: "status",
                          uri: ""
                        }
                      },
                      $ns: {
                        uri: "http://opds-spec.org/2010/catalog",
                        local: "availability"
                      }
                    }
                  ]
                },
                {
                  $: {
                    href: {
                      name: "href",
                      value: "http://test-cm.com/catalogUrl/works/9/fulfill/2",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value: "http://opds-spec.org/acquisition/open-access",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    },
                    type: {
                      name: "type",
                      value: "application/kepub+zip",
                      prefix: "",
                      local: "type",
                      uri: ""
                    },
                    "dcterms:rights": {
                      name: "dcterms:rights",
                      value:
                        "http://librarysimplified.org/terms/rights-status/generic-open-access",
                      prefix: "dcterms",
                      local: "rights",
                      uri: "http://purl.org/dc/terms/"
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  },
                  "opds:availability": [
                    {
                      $: {
                        status: {
                          name: "status",
                          value: "available",
                          prefix: "",
                          local: "status",
                          uri: ""
                        }
                      },
                      $ns: {
                        uri: "http://opds-spec.org/2010/catalog",
                        local: "availability"
                      }
                    }
                  ]
                },
                {
                  $: {
                    href: {
                      name: "href",
                      value: "http://test-cm.com/catalogUrl/works/9/fulfill/2",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value: "http://opds-spec.org/acquisition/open-access",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    },
                    type: {
                      name: "type",
                      value: "application/epub+zip",
                      prefix: "",
                      local: "type",
                      uri: ""
                    },
                    "dcterms:rights": {
                      name: "dcterms:rights",
                      value:
                        "http://librarysimplified.org/terms/rights-status/generic-open-access",
                      prefix: "dcterms",
                      local: "rights",
                      uri: "http://purl.org/dc/terms/"
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  },
                  "opds:availability": [
                    {
                      $: {
                        status: {
                          name: "status",
                          value: "available",
                          prefix: "",
                          local: "status",
                          uri: ""
                        }
                      },
                      $ns: {
                        uri: "http://opds-spec.org/2010/catalog",
                        local: "availability"
                      }
                    }
                  ]
                },
                {
                  $: {
                    href: {
                      name: "href",
                      value: "http://test-cm.com/catalogUrl/works/9/fulfill/8",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value: "http://opds-spec.org/acquisition/open-access",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    },
                    type: {
                      name: "type",
                      value: "application/kepub+zip",
                      prefix: "",
                      local: "type",
                      uri: ""
                    },
                    "dcterms:rights": {
                      name: "dcterms:rights",
                      value:
                        "http://librarysimplified.org/terms/rights-status/generic-open-access",
                      prefix: "dcterms",
                      local: "rights",
                      uri: "http://purl.org/dc/terms/"
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  },
                  "opds:availability": [
                    {
                      $: {
                        status: {
                          name: "status",
                          value: "available",
                          prefix: "",
                          local: "status",
                          uri: ""
                        }
                      },
                      $ns: {
                        uri: "http://opds-spec.org/2010/catalog",
                        local: "availability"
                      }
                    }
                  ]
                },
                {
                  $: {
                    href: {
                      name: "href",
                      value: "http://test-cm.com/catalogUrl/works/9/fulfill/7",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value: "http://opds-spec.org/acquisition/open-access",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    },
                    type: {
                      name: "type",
                      value: "application/x-mobi8-ebook",
                      prefix: "",
                      local: "type",
                      uri: ""
                    },
                    "dcterms:rights": {
                      name: "dcterms:rights",
                      value:
                        "http://librarysimplified.org/terms/rights-status/generic-open-access",
                      prefix: "dcterms",
                      local: "rights",
                      uri: "http://purl.org/dc/terms/"
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  },
                  "opds:availability": [
                    {
                      $: {
                        status: {
                          name: "status",
                          value: "available",
                          prefix: "",
                          local: "status",
                          uri: ""
                        }
                      },
                      $ns: {
                        uri: "http://opds-spec.org/2010/catalog",
                        local: "availability"
                      }
                    }
                  ]
                },
                {
                  $: {
                    href: {
                      name: "href",
                      value:
                        "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/related_books",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    type: {
                      name: "type",
                      value:
                        "application/atom+xml;profile=opds-catalog;kind=acquisition",
                      prefix: "",
                      local: "type",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value: "related",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    },
                    title: {
                      name: "title",
                      value: "Recommended Works",
                      prefix: "",
                      local: "title",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  }
                },
                {
                  $: {
                    href: {
                      name: "href",
                      value:
                        "http://test-cm.com/catalogUrl/annotations/URI/https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    type: {
                      name: "type",
                      value:
                        'application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"',
                      prefix: "",
                      local: "type",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value: "http://www.w3.org/ns/oa#annotationService",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  }
                },
                {
                  $: {
                    href: {
                      name: "href",
                      value:
                        "http://test-cm.com/catalogUrl/analytics/URI/https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/open_book",
                      prefix: "",
                      local: "href",
                      uri: ""
                    },
                    rel: {
                      name: "rel",
                      value:
                        "http://librarysimplified.org/terms/rel/analytics/open-book",
                      prefix: "",
                      local: "rel",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "link"
                  }
                }
              ],
              category: [
                {
                  $: {
                    term: {
                      name: "term",
                      value: "Adult",
                      prefix: "",
                      local: "term",
                      uri: ""
                    },
                    scheme: {
                      name: "scheme",
                      value: "http://schema.org/audience",
                      prefix: "",
                      local: "scheme",
                      uri: ""
                    },
                    label: {
                      name: "label",
                      value: "Adult",
                      prefix: "",
                      local: "label",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "category"
                  }
                },
                {
                  $: {
                    term: {
                      name: "term",
                      value:
                        "http://librarysimplified.org/terms/fiction/Fiction",
                      prefix: "",
                      local: "term",
                      uri: ""
                    },
                    scheme: {
                      name: "scheme",
                      value: "http://librarysimplified.org/terms/fiction/",
                      prefix: "",
                      local: "scheme",
                      uri: ""
                    },
                    label: {
                      name: "label",
                      value: "Fiction",
                      prefix: "",
                      local: "label",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "category"
                  }
                },
                {
                  $: {
                    term: {
                      name: "term",
                      value:
                        "http://librarysimplified.org/terms/genres/Simplified/Classics",
                      prefix: "",
                      local: "term",
                      uri: ""
                    },
                    scheme: {
                      name: "scheme",
                      value:
                        "http://librarysimplified.org/terms/genres/Simplified/",
                      prefix: "",
                      local: "scheme",
                      uri: ""
                    },
                    label: {
                      name: "label",
                      value: "Classics",
                      prefix: "",
                      local: "label",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "category"
                  }
                },
                {
                  $: {
                    term: {
                      name: "term",
                      value:
                        "http://librarysimplified.org/terms/genres/Simplified/Romance",
                      prefix: "",
                      local: "term",
                      uri: ""
                    },
                    scheme: {
                      name: "scheme",
                      value:
                        "http://librarysimplified.org/terms/genres/Simplified/",
                      prefix: "",
                      local: "scheme",
                      uri: ""
                    },
                    label: {
                      name: "label",
                      value: "Romance",
                      prefix: "",
                      local: "label",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "category"
                  }
                },
                {
                  $: {
                    term: {
                      name: "term",
                      value:
                        "http://librarysimplified.org/terms/genres/Simplified/Historical%20Fiction",
                      prefix: "",
                      local: "term",
                      uri: ""
                    },
                    scheme: {
                      name: "scheme",
                      value:
                        "http://librarysimplified.org/terms/genres/Simplified/",
                      prefix: "",
                      local: "scheme",
                      uri: ""
                    },
                    label: {
                      name: "label",
                      value: "Historical Fiction",
                      prefix: "",
                      local: "label",
                      uri: ""
                    }
                  },
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "category"
                  }
                }
              ],
              "dcterms:language": [
                {
                  _: "en",
                  $ns: {
                    uri: "http://purl.org/dc/terms/",
                    local: "language"
                  }
                }
              ],
              "dcterms:publisher": [
                {
                  _: "Standard Ebooks",
                  $ns: {
                    uri: "http://purl.org/dc/terms/",
                    local: "publisher"
                  }
                }
              ],
              "dcterms:issued": [
                {
                  _: "1813-01-29",
                  $ns: {
                    uri: "http://purl.org/dc/terms/",
                    local: "issued"
                  }
                }
              ],
              id: [
                {
                  _:
                    "https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice",
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "id"
                  }
                }
              ],
              "bibframe:distribution": [
                {
                  $: {
                    "bibframe:ProviderName": {
                      name: "bibframe:ProviderName",
                      value: "Standard Ebooks",
                      prefix: "bibframe",
                      local: "ProviderName",
                      uri: "http://bibframe.org/vocab/"
                    }
                  },
                  $ns: {
                    uri: "http://bibframe.org/vocab/",
                    local: "distribution"
                  }
                }
              ],
              published: [
                {
                  _: "2019-05-24T00:00:00Z",
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "published"
                  }
                }
              ],
              updated: [
                {
                  _: "2019-05-24T05:03:53Z",
                  $ns: {
                    uri: "http://www.w3.org/2005/Atom",
                    local: "updated"
                  }
                }
              ]
            }
          },
          {
            id:
              "https://standardebooks.org/ebooks/jane-austen/sense-and-sensibility",
            title: "Sense and Sensibility",
            series: null,
            authors: ["Jane Austen"],
            contributors: [],
            summary:
              "<p>Elinor and Marianne are two daughters of Mr. Dashwood by his second wife. They have a younger sister, Margaret, and an older half-brother named John. When their father dies, the family estate passes to John and the Dashwood women are left in reduced circumstances. Fortunately, a distant relative offers to rent the women a cottage on his property.\n<br>The novel follows the Dashwood sisters to their new home, where they experience both romance and heartbreak.</p>",
            imageUrl:
              "https://s3.amazonaws.com/open-bookshelf-covers/scaled/300/Standard+Ebooks/URI/https%3A//standardebooks.org/ebooks/jane-austen/sense-and-sensibility/cover.png",
            openAccessLinks: [
              {
                url: "http://test-cm.com/catalogUrl/works/5734/fulfill/6",
                type: "application/x-mobi8-ebook"
              },
              {
                url: "http://test-cm.com/catalogUrl/works/5734/fulfill/8",
                type: "application/epub+zip"
              },
              {
                url: "http://test-cm.com/catalogUrl/works/5734/fulfill/2",
                type: "application/epub+zip"
              },
              {
                url: "http://test-cm.com/catalogUrl/works/5734/fulfill/2",
                type: "application/epub+zip"
              },
              {
                url: "http://test-cm.com/catalogUrl/works/5734/fulfill/7",
                type: "application/x-mobi8-ebook"
              }
            ],
            borrowUrl:
              "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/sense-and-sensibility/borrow",
            fulfillmentLinks: [],
            availability: {
              status: "available"
            },
            holds: null,
            copies: null,
            publisher: "Standard Ebooks",
            categories: [
              "Adult",
              "Fiction",
              "Romance",
              "Humorous Fiction",
              "Literary Fiction",
              "Historical Fiction"
            ],
            language: "en",
            url:
              "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/sense-and-sensibility"
          },
          {
            id: "https://standardebooks.org/ebooks/jane-austen/persuasion",
            title: "Persuasion",
            series: null,
            authors: ["Jane Austen"],
            contributors: [],
            summary:
              "Persuasion is Jane Austen's last completed novel. She began it soon after she had finishedEmma and completed it in August 1816. She died, aged 41, in 1817; Persuasion was published in December of that year (but dated 1818).<br><br>\nPersuasion is linked to Northanger Abbey not only by the fact that the two books were originally bound up in one volume and published together, but also because both stories are set partly inBath, a fashionable city with which Austen was well acquainted, having lived there from 1801 to 1805.\n<br><br>\nBesides the theme of persuasion, the novel evokes other topics, such as the Royal Navy, in which two of Jane Austen's brothers ultimately rose to the rank of admiral. As in Northanger Abbey, the superficial social life of Bath—well known to Austen, who spent several relatively unhappy and unproductive years there—is portrayed extensively and serves as a setting for the second half of the book. In many respects, Persuasion marks a break with Austen's previous works, both in the more biting, even irritable satire directed at some of the novel's characters and in the regretful, resigned outlook of its otherwise admirable heroine, Anne Elliot, in the first part of the story. Against this is set the energy and appeal of the Royal Navy, which symbolises for Anne and the reader the possibility of a more outgoing, engaged, and fulfilling life, and it is this worldview which triumphs for the most part at the end of the novel.",
            imageUrl:
              "https://s3.amazonaws.com/open-bookshelf-covers/scaled/300/Standard+Ebooks/URI/https%3A//standardebooks.org/ebooks/jane-austen/persuasion/cover.png",
            openAccessLinks: [
              {
                url: "http://test-cm.com/catalogUrl/works/2746/fulfill/2",
                type: "application/epub+zip"
              },
              {
                url: "http://test-cm.com/catalogUrl/works/2746/fulfill/8",
                type: "application/kepub+zip"
              },
              {
                url: "http://test-cm.com/catalogUrl/works/2746/fulfill/7",
                type: "application/x-mobi8-ebook"
              }
            ],
            borrowUrl:
              "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/persuasion/borrow",
            fulfillmentLinks: [],
            availability: {
              status: "available"
            },
            holds: null,
            copies: null,
            publisher: "Standard Ebooks",
            categories: ["Adult", "Fiction", "Romance", "Literary Fiction"],
            language: "en",
            url:
              "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/persuasion"
          },
          {
            id: "https://standardebooks.org/ebooks/jane-austen/emma",
            title: "Emma",
            series: null,
            authors: ["Jane Austen"],
            contributors: [],
            summary:
              "<p>Emma has lived a pampered, protected life and consequently is somewhat unrealistic in her regard for herself and her own abilities.She befriends Harriet Smith, a young woman of dubious parentage and no money and determines to improve her prospects. As part of this project, Emma decides to become a matchmaker between Harriet and the Reverend Mr. Elton, a vicar in the nearby town. Things, however, do not go as smoothly as she had imagined. Emma provides an insight into the distinctions in the rigid class structure of England in the Regency period, and the social barriers to marriage between persons considered to be of superior and inferior rank.</p>",
            imageUrl:
              "https://s3.amazonaws.com/open-bookshelf-covers/scaled/300/Standard+Ebooks/URI/https%3A//standardebooks.org/ebooks/jane-austen/emma/cover.png",
            openAccessLinks: [
              {
                url: "http://test-cm.com/catalogUrl/works/13/fulfill/7",
                type: "application/x-mobipocket-ebook"
              },
              {
                url: "http://test-cm.com/catalogUrl/works/13/fulfill/2",
                type: "application/epub+zip"
              },
              {
                url: "http://test-cm.com/catalogUrl/works/13/fulfill/2",
                type: "application/epub+zip"
              },
              {
                url: "http://test-cm.com/catalogUrl/works/13/fulfill/6",
                type: "application/x-mobipocket-ebook"
              }
            ],
            borrowUrl:
              "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/emma/borrow",
            fulfillmentLinks: [],
            availability: {
              status: "available"
            },
            holds: null,
            copies: null,
            publisher: "Standard Ebooks",
            published: "December 24, 1815",
            categories: [
              "Adult",
              "Fiction",
              "Humorous Fiction",
              "Literary Fiction",
              "Romance"
            ],
            language: "en",
            url:
              "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/emma"
          }
        ]
      }
    ],
    navigationLinks: [],
    books: [],
    facetGroups: [],
    search: {
      url: "http://test-cm.com/catalogUrl/search/"
    },
    catalogRootLink: {
      url: "http://test-cm.com/catalogUrl/groups/",
      text: "All Books",
      type: "start"
    },
    parentLink: null,
    shelfUrl: "http://test-cm.com/catalogUrl/loans/",
    links: [
      {
        url:
          "http://test-cm.com/catalogUrl/works/URI/https://standardebooks.org/ebooks/jane-austen/emma/related_books?available=all&after=0&collection=main&entrypoint=Book&order=author&size=50",
        type: "self"
      },
      {
        url: "http://test-cm.com/catalogUrl/groups/",
        text: "All Books",
        type: "start"
      },
      {
        url: "http://test-cm.com/catalogUrl/authentication_document",
        type: "http://opds-spec.org/auth/document"
      },
      {
        url: "http://test-cm.com/catalogUrl/search/",
        type: "search"
      },
      {
        url: "http://test-cm.com/catalogUrl/loans/",
        type: "http://opds-spec.org/shelf"
      },
      {
        url: "http://test-cm.com/catalogUrl/annotations/",
        type: "http://www.w3.org/ns/oa#annotationService"
      },
      {
        url: "https://www.loc.gov/",
        text: "LOC",
        type: "related"
      },
      {
        url: "mailto:williams@amigos.org",
        type: "help"
      },
      {
        url: "https://help.examplexyz.com/",
        type: "help"
      }
    ]
  }
};
