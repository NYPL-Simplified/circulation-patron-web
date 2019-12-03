import * as React from "react";
import { AuthProvider, AuthMethod } from "opds-web-client/lib/interfaces";
import { AuthButtonProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";

export interface AuthLink {
  rel: string;
  href: string;
}

export interface OAuthMethod extends AuthMethod {
  links?: AuthLink[];
}

export default class OAuthButton extends React.Component<
  AuthButtonProps<OAuthMethod>,
  {}
> {
  render() {
    let currentUrl = window.location.origin + window.location.pathname;
    let authUrl;
    let image;
    for (const link of this.props.provider.method.links || []) {
      if (link.rel === "authenticate") {
        authUrl =
          link.href +
          "&redirect_uri=" +
          encodeURIComponent(encodeURIComponent(currentUrl));
      }
      if (link.rel === "logo") {
        image = link.href;
      }
      if (authUrl && image) {
        break;
      }
    }
    let label = this.props.provider.method.description
      ? "Log in with " + this.props.provider.method.description
      : "Log in";
    return authUrl ? (
      <a href={authUrl} className="oauth-button" aria-label={label}>
        {image && <img src={image} alt={label} />}
      </a>
    ) : null;
  }
}
