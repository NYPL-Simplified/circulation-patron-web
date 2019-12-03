import * as React from "react";
import { FooterProps } from "opds-web-client/lib/components/Root";
import { LinkData } from "opds-web-client/lib/interfaces";

export default class Footer extends React.Component<FooterProps, {}> {
  constructor(props) {
    super(props);
    this.links = this.links.bind(this);
  }

  links(): LinkData[] {
    let links = [];

    let labels = {
      about: "About",
      "terms-of-service": "Terms of Service",
      "privacy-policy": "Privacy Policy",
      copyright: "Copyright"
    };

    Object.keys(labels).forEach(type => {
      let link = this.props.collection.links.find(link => link.type === type);
      if (link) {
        let linkWithLabel = Object.assign({}, link, { text: labels[type] });
        links.push(linkWithLabel);
      }
    });
    return links;
  }

  render(): JSX.Element {
    return (
      <ul aria-label="about links" className="list-inline">
        {this.links().map(link => (
          <li key={link.url}>
            <a href={link.url} target="_blank">
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    );
  }
}
