import * as React from "react";
import { AuthMethod } from "opds-web-client/lib/interfaces";
import { AuthButtonProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";
import Button from "components/Button";

export interface AuthLink {
  rel: string;
  href: string;
}

export interface CleverAuthMethod extends AuthMethod {
  links?: AuthLink[];
}

export default class CleverButton extends React.Component<
  AuthButtonProps<CleverAuthMethod>,
  any
> {
  render() {
    const currentUrl = window.location.origin + window.location.pathname;
    let authUrl;

    for (const link of this.props?.provider?.method.links || []) {
      if (link.rel === "authenticate") {
        authUrl =
          link.href +
          "&redirect_uri=" +
          encodeURIComponent(encodeURIComponent(currentUrl));

        break;
      }
    }

    return authUrl ? (
      <a href={authUrl}>
        <Button
          type="submit"
          sx={{ alignSelf: "flex-end", m: 2, mr: 0, flex: "1 0 auto" }}
          aria-label="log in with clever"
        >
          Log In With Clever
        </Button>
      </a>
    ) : null;
  }
}
