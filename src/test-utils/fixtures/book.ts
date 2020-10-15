import {
  AnyBook,
  Book,
  BorrowableBook,
  FulfillableBook,
  FulfillmentLink
} from "interfaces";
import merge from "deepmerge";

export function mergeBook<T extends AnyBook>(
  input: Partial<Book> & Omit<T, keyof Book>
): T {
  return merge(book, input, {
    arrayMerge: (a, b) => b
  }) as T;
}

export function makeBook(i: number): Book {
  return {
    id: `Book Id ${i}`,
    url: `/book-url-${i}`,
    title: `Book Title ${i}`,
    authors: [`Book ${i} author`],
    publisher: `Book ${i} publisher`,
    categories: [`Book ${i} cat 1`, `Book ${i} cat 2`],
    relatedUrl: `/related-url-${i}`,
    trackOpenBookUrl: `/track-open-book-${i}`
  };
}

/**
 * makes n books with a make function that takes index and outputs some
 * custom book info which gets merged with the default book fixture
 */
export function makeBorrowableBooks(n: number) {
  const books: BorrowableBook[] = [];
  for (let i = 0; i < n; i++) {
    books[i] = {
      ...makeBook(i),
      status: "borrowable",
      borrowUrl: `/borrow-${i}`
    };
  }
  return books;
}

export function makeFulfillableBooks(n: number): FulfillableBook[] {
  const books: FulfillableBook[] = [];
  for (let i = 0; i < n; i++) {
    books[i] = {
      ...makeBook(i),
      status: "fulfillable",
      revokeUrl: `/revoke-${i}`,
      fulfillmentLinks: [
        {
          url: `/fulfill-${i}`,
          supportLevel: "show",
          contentType: "application/epub+zip"
        }
      ]
    };
  }
  return books;
}

export const book: Book = {
  id: "urn:librarysimplified.org/terms/id/3M%20ID/crrmnr9",
  relatedUrl: "http://related-url",
  trackOpenBookUrl: "/track-open-book",
  url: "http://test-book-url",
  title: "The Mayan Secrets",
  authors: ["Clive Cussler", "Thomas Perry"],
  contributors: ["contributor 1"],
  summary:
    "&lt;b&gt;Sam and Remi Fargo race for treasure&#8212;and survival&#8212;in this lightning-paced new adventure from #1&lt;i&gt; New York Times&lt;/i&gt; bestselling author Clive Cussler.&lt;/b&gt;&lt;br /&gt;&lt;br /&gt;Husband-and-wife team Sam and Remi Fargo are in Mexico when they come upon a remarkable discovery&#8212;the mummified remainsof a man clutching an ancient sealed pot. Within the pot is a Mayan book larger than any known before.&lt;br /&gt;&lt;br /&gt;The book contains astonishing information about the Mayans, their cities, and about mankind itself. The secrets are so powerful that some people would do anything to possess them&#8212;as the Fargos are about to find out. Many men and women are going to die for that book.",
  imageUrl: "https://dlotdqc6pnwqb.cloudfront.net/3M/crrmnr9/cover.jpg",
  publisher: "Penguin Publishing Group",
  published: "February 29, 2016",
  categories: ["Children", "10-12", "Fiction", "Adventure", "Fantasy"],
  raw: {
    category: [
      {
        $: {
          scheme: { value: "http://schema.org/audience" },
          label: { value: "Children" }
        }
      },
      {
        $: {
          scheme: { value: "http://schema.org/typicalAgeRange" },
          label: { value: "10-12" }
        }
      },
      {
        $: {
          scheme: { value: "http://librarysimplified.org/terms/fiction/" },
          label: { value: "Fiction" }
        }
      },
      {
        $: {
          scheme: {
            value: "http://librarysimplified.org/terms/genres/Simplified/"
          },
          label: { value: "Adventure" }
        }
      },
      {
        $: {
          scheme: {
            value: "http://librarysimplified.org/terms/genres/Simplified/"
          },
          label: { value: "Fantasy" }
        }
      }
    ],
    "bibframe:distribution": [
      {
        $: {
          "bibframe:ProviderName": {
            value: "Overdrive"
          }
        }
      }
    ],
    link: [
      {
        $: {
          rel: { value: "issues" },
          href: { value: "/report-url" }
        }
      },
      {
        $: {
          rel: { value: "http://librarysimplified.org/terms/rel/revoke" },
          href: { value: "http://example.com/revoke" }
        }
      },
      {
        $: {
          rel: {
            value: "related"
          },
          href: {
            value: "/related-url"
          }
        }
      }
    ]
  }
};

export const borrowableBook: BorrowableBook = {
  ...book,
  borrowUrl: "/borrow",
  status: "borrowable"
};

export const fulfillmentLink: FulfillmentLink = {
  contentType: "application/epub+zip",
  url: "/epub",
  supportLevel: "show"
};

export const fulfillableBook: FulfillableBook = {
  ...book,
  status: "fulfillable",
  revokeUrl: "/revoke",
  fulfillmentLinks: [fulfillmentLink]
};

export default book;
