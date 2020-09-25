import * as React from "react";
import { render } from "../../test-utils";
import Link from "../Link";

test("Renders expected styles", () => {
  const utils = render(<Link href="/somewhere">click here</Link>);
  expect(utils.getByText("click here")).toMatchSnapshot();
});
test("Renders proper href with standard next.js href prop", () => {
  const utils = render(<Link href="/somewhere-new">click here</Link>);
  expect(utils.getByText("click here")).toHaveAttribute(
    "href",
    "/somewhere-new"
  );
});
test("Renders proper href with standard next.js href+as props", () => {
  const utils = render(
    <Link href="/[library]/home" as="/mylib/home">
      click here
    </Link>
  );
  expect(utils.getByText("click here")).toHaveAttribute("href", "/mylib/home");
});
test("Renders proper href with bookUrl prop", () => {
  const utils = render(<Link bookUrl="http://some.book.com/">click here</Link>);
  expect(
    utils.getByText("click here").closest("a")?.href
  ).toMatchInlineSnapshot(
    `"http://test-domain.com/book/http%3A%2F%2Fsome.book.com%2F"`
  );
});
test("Renders proper href with collectionUrl prop", () => {
  const utils = render(
    <Link collectionUrl="http://some.collection.com/">click here</Link>
  );
  expect(
    utils.getByText("click here").closest("a")?.href
  ).toMatchInlineSnapshot(
    `"http://test-domain.com/collection/http%3A%2F%2Fsome.collection.com%2F"`
  );
});
test("When collectionUrl is your base url, links to home", () => {
  const utils = render(
    <Link collectionUrl="http://test-cm.com/catalogUrl">click here</Link>
  );
  expect(utils.getByText("click here").closest("a")?.href).toEqual(
    "http://test-domain.com/"
  );
});

test("When collectionUrl is your base url (with slash), links to home", () => {
  const utils = render(
    <Link collectionUrl="http://test-cm.com/catalogUrl/">click here</Link>
  );
  expect(utils.getByText("click here").closest("a")?.href).toEqual(
    "http://test-domain.com/"
  );
});
