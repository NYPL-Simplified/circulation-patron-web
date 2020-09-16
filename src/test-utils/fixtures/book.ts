import { BookData } from "interfaces";
import merge from "deepmerge";

export const mergeBook = (input: Partial<BookData>) =>
  merge<BookData>(book, input, {
    arrayMerge: (a, b) => b
  });

export function makeBook(i: number) {
  return {
    id: `Book Id ${i}`,
    url: `/book-url-${i}`,
    title: `Book Title ${i}`,
    authors: [`Book ${i} author`],
    publisher: `Book ${i} publisher`,
    categories: [`Book ${i} cat 1`, `Book ${i} cat 2`]
  };
}

/**
 * makes n books with a make function that takes index and outputs some
 * custom book info which gets merged with the default book fixture
 */
export function makeBooks(
  n: number,
  make: (i: number) => Partial<BookData> = makeBook
) {
  const books: BookData[] = [];
  for (let i = 0; i < n; i++) {
    books[i] = mergeBook(make(i));
  }
  return books;
}

export const book: BookData = {
  id: "urn:librarysimplified.org/terms/id/3M%20ID/crrmnr9",
  url: "/test-book-url",
  title: "The Mayan Secrets",
  authors: ["Clive Cussler", "Thomas Perry"],
  contributors: ["contributor 1"],
  summary:
    "&lt;b&gt;Sam and Remi Fargo race for treasure&#8212;and survival&#8212;in this lightning-paced new adventure from #1&lt;i&gt; New York Times&lt;/i&gt; bestselling author Clive Cussler.&lt;/b&gt;&lt;br /&gt;&lt;br /&gt;Husband-and-wife team Sam and Remi Fargo are in Mexico when they come upon a remarkable discovery&#8212;the mummified remainsof a man clutching an ancient sealed pot. Within the pot is a Mayan book larger than any known before.&lt;br /&gt;&lt;br /&gt;The book contains astonishing information about the Mayans, their cities, and about mankind itself. The secrets are so powerful that some people would do anything to possess them&#8212;as the Fargos are about to find out. Many men and women are going to die for that book.",
  imageUrl: "https://dlotdqc6pnwqb.cloudfront.net/3M/crrmnr9/cover.jpg",
  borrowUrl: "borrow url",
  allBorrowLinks: [
    {
      url: "/epub-borrow-link",
      type: "application/atom+xml;type=entry;profile=opds-catalog",
      indirectType: "application/vnd.adobe.adept+xml"
    }
  ],
  openAccessLinks: [
    { url: "/epub-open-access-link", type: "application/epub+zip" },
    {
      url: "/pdf-open-access-link",
      type: "application/pdf"
    }
  ],
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

export default book;
