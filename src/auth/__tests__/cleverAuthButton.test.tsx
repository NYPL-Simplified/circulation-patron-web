import * as React from "react";
import { render } from "../../test-utils";
import { CleverButton, getAuthUrl } from "../cleverAuthButton";

describe("CleverButton", () => {
  let wrapper: any;
  let provider: any;

  beforeEach(() => {
    provider = {
      id: "http://librarysimplified.org/authtype/OAuth-with-intermediary",
      plugin: {
        type: "http://librarysimplified.org/authtype/OAuth-with-intermediary",
        lookForCredentials: jest.fn(),
        buttonComponent: jest.fn()
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

  it("constructs proper authUrl", () => {
    expect(getAuthUrl(provider, "/")).toBe(
      "https://testing.com/USOEI/oauth_authenticate?provider=Clever&redirect_uri=%252F"
    );
  });

  it("when there is an auth provider returns button labeled Log In With Clever", () => {
    const buttonLabelText = wrapper.getByLabelText("Log In with Clever");
    const buttonText = wrapper.getByText("Log In With Clever");
    expect(buttonLabelText).toBeInTheDocument();
    expect(buttonText).toBeInTheDocument();
  });

  it("when there is no auth provider returns empty element", () => {
    const { container } = render(<CleverButton provider={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
