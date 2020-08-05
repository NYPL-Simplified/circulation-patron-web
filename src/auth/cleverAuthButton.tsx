import * as React from "react";
import { AuthProvider, AuthMethod } from "opds-web-client/lib/interfaces";
import { AuthButtonProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";

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
    console.log("provider?", this.props.provider);
    for (const link of this.props?.provider?.method.links || []) {
      if (link.rel === "authenticate") {
        authUrl =
          link.href +
          "&redirect_uri=" +
          encodeURIComponent(encodeURIComponent(currentUrl));
        break;
      }
    }

    authUrl = "https://www.google.com";
    return authUrl ? (
      <a
        href={authUrl}
        className="clever-button"
        aria-label="log in with clever"
      >
        logged
      </a>
    ) : null;
  }
}
