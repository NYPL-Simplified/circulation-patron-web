import * as React from "react";
import { render, fixtures } from "test-utils";
import BookCard from "components/BookCard";
import mockConfig from "test-utils/mockConfig";
import { FulfillableBook } from "interfaces";

const fulfillableBook = fixtures.mergeBook<FulfillableBook>({
  ...fixtures.book,
  status: "fulfillable",
  fulfillmentLinks: [],
  revokeUrl: "/revoke"
});

test("shows medium indicator when configured", () => {
  mockConfig();
  const utils = render(<BookCard book={fulfillableBook} />);

  expect(utils.getAllByLabelText("Book Medium: eBook")).toHaveLength(2);
});

test("doesn't medium indicator when not configured", () => {
  mockConfig({ showMedium: false });
  const utils = render(<BookCard book={fulfillableBook} />);

  expect(utils.getAllByLabelText("Book Medium: eBook")).toHaveLength(1);
});
