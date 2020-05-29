import * as React from "react";
import { render } from "../../test-utils";
import Link from "../Link";
import { IS_MULTI_LIBRARY } from "../../utils/env";

test("Renders expected styles", () => {
  const utils = render(<Link href="/somewhere">click here</Link>);
  expect(utils.getByText("click here")).toMatchInlineSnapshot(`
    .emotion-0 {
      cursor: pointer;
      -webkit-text-decoration: none;
      text-decoration: none;
      -webkit-text-decoration: none;
      text-decoration: none;
      color: inherit;
    }

    <a
      class="emotion-0"
      href="/somewhere"
    >
      click here
    </a>
  `);
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
    `"http://test-domain.com/collection/http%3A%2F%2Fsome.collection.com"`
  );
});
test("When collectionUrl is your base url, links to home", () => {
  const utils = render(
    <Link collectionUrl="http://simplye-dev-cm.amigos.org/xyzlib">
      click here
    </Link>
  );
  expect(utils.getByText("click here").closest("a")?.href).toEqual(
    "http://test-domain.com/"
  );
});
