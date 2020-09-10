import * as React from "react";
import { render } from "../../../test-utils";

import CleverButton from "../../cleverAuthButton";

describe("CleverButton", () => {
  let wrapper: any;
  let provider: any;

  beforeEach(() => {
    provider = {
      id: "http://librarysimplified.org/authtype/OAuth-with-intermediary",
      plugin: {
        type: "http://librarysimplified.org/authtype/OAuth-with-intermediary"
      },
      method: {
        type: "http://librarysimplified.org/authtype/OAuth-with-intermediary",
        description: "Clever",
        links: [
          {
            href:
              "https://testing.com/USOEI/oauth_authenticate?provider=Clever",
            rel: "authenticate"
          }
        ]
      }
    };
    wrapper = render(<CleverButton provider={provider} />);
  });

  it("links to authenticate with redirect", () => {
    expect(
      wrapper.getByText("Log In With Clever").closest("a")
    ).toHaveAttribute(
      "href",
      "https://testing.com/USOEI/oauth_authenticate?provider=Clever&redirect_uri=http%253A%252F%252Ftest-domain.com%252F"
    );
  });
});
