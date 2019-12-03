import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import BookDetailsContainer from "../BookDetailsContainer";
import BookDetails from "../BookDetails";
import Lanes from "opds-web-client/lib/components/Lanes";
import buildStore from "../../store";

let book = {
  id: "urn:librarysimplified.org/terms/id/3M%20ID/crrmnr9",
  url: "http://circulation.librarysimplified.org/works/3M/crrmnr9",
  title: "The Mayan Secrets",
  authors: ["Clive Cussler", "Thomas Perry"],
  contributors: ["contributor 1"],
  summary:
    "&lt;b&gt;Sam and Remi Fargo race for treasure&#8212;and survival&#8212;in this lightning-paced new adventure from #1&lt;i&gt; New York Times&lt;/i&gt; bestselling author Clive Cussler.&lt;/b&gt;&lt;br /&gt;&lt;br /&gt;Husband-and-wife team Sam and Remi Fargo are in Mexico when they come upon a remarkable discovery&#8212;the mummified remainsof a man clutching an ancient sealed pot. Within the pot is a Mayan book larger than any known before.&lt;br /&gt;&lt;br /&gt;The book contains astonishing information about the Mayans, their cities, and about mankind itself. The secrets are so powerful that some people would do anything to possess them&#8212;as the Fargos are about to find out. Many men and women are going to die for that book.",
  imageUrl: "https://dlotdqc6pnwqb.cloudfront.net/3M/crrmnr9/cover.jpg",
  borrowUrl: "borrow url",
  raw: {
    link: [
      {
        $: {
          rel: { value: "related" },
          href: { value: "related url" }
        }
      }
    ]
  }
};

class DefaultBookDetails extends React.Component<any, any> {
  render() {
    return <div></div>;
  }
}

describe("BookDetailsContainer", () => {
  let wrapper;
  let store;
  let context;
  let borrowBook = url => Promise.resolve();
  let fulfillBook = url => Promise.resolve();

  beforeEach(() => {
    store = buildStore();
    context = { store };
    wrapper = shallow(
      <BookDetailsContainer
        book={book}
        bookUrl="book url"
        collectionUrl="collection url"
        refreshCatalog={() => Promise.resolve()}
      >
        <DefaultBookDetails
          book={book}
          borrowBook={borrowBook}
          fulfillBook={fulfillBook}
          isSignedIn={true}
        />
      </BookDetailsContainer>,
      { context }
    );
  });

  it("renders BookDetails with its child's props", () => {
    let bookDetails = wrapper.find(BookDetails);
    expect(bookDetails.prop("book")).to.equal(book);
    expect(bookDetails.prop("borrowBook")).to.equal(borrowBook);
    expect(bookDetails.prop("fulfillBook")).to.equal(fulfillBook);
    expect(bookDetails.prop("isSignedIn")).to.equal(true);
  });

  it("renders related lanes", () => {
    let lanes = wrapper.find(Lanes);
    expect(lanes.prop("url")).to.equal("related url");
    expect(lanes.prop("store")).to.equal(store);
    expect(lanes.prop("hideMoreLinks")).to.equal(true);
    expect(lanes.prop("hiddenBookIds")).to.deep.equal([book.id]);
    expect(lanes.prop("namespace")).to.equal("recommendations");
  });
});
