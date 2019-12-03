import * as React from "react";
import BookDetails from "./BookDetails";
import Lanes from "opds-web-client/lib/components/Lanes";
import { BookDetailsContainerProps } from "opds-web-client/lib/components/Root";
import * as PropTypes from "prop-types";

export default class BookDetailsContainer extends React.Component<
  BookDetailsContainerProps,
  {}
> {
  context: any;

  static contextTypes: React.ValidationMap<{}> = {
    store: PropTypes.object.isRequired
  };

  render() {
    let child = React.Children.only(this.props.children);
    let bookProps = Object.assign({}, child.props, {
      store: this.context.store
    });
    let book = React.createElement(BookDetails, child.props);
    let relatedUrl = this.relatedUrl();

    return (
      <div className="book-details-container">
        {book}
        {relatedUrl && (
          <div className="related-books">
            <Lanes
              url={relatedUrl}
              store={this.context.store}
              namespace="recommendations"
              hideMoreLinks={true}
              hiddenBookIds={this.props.book ? [this.props.book.id] : []}
            />
          </div>
        )}
      </div>
    );
  }

  relatedUrl(): string {
    let { book } = this.props;
    if (!book) return null;

    let links = book.raw.link;
    if (!links) return null;

    let relatedLink = links.find(link => link.$.rel.value === "related");
    if (!relatedLink) return null;

    return relatedLink.$.href.value;
  }
}
