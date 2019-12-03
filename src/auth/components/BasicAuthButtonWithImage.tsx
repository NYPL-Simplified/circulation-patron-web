import * as React from "react";
import { BasicAuthMethod } from "opds-web-client/lib/interfaces";
import { AuthButtonProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";

export interface AuthLink {
  rel: string;
  href: string;
}

export interface BasicAuthWithImageMethod extends BasicAuthMethod {
  links?: AuthLink[];
}

export default class BasicAuthButtonWithImage extends React.Component<
  AuthButtonProps<BasicAuthWithImageMethod>,
  {}
> {
  render() {
    let image;
    for (const link of this.props.provider.method.links || []) {
      if (link.rel === "logo") {
        image = link.href;
        break;
      }
    }
    let label = this.props.provider.method.description
      ? "Log in with " + this.props.provider.method.description
      : "Log in";
    return (
      <button
        className="basic-auth-button"
        aria-label={label}
        autoFocus={true}
        onClick={this.props.onClick}
      >
        {image ? <img src={image} alt={label} /> : label}
      </button>
    );
  }
}
