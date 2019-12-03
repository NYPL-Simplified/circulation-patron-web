import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { fetchComplaintTypes, postComplaint } from "../actions";
import DefaultBookDetails, {
  BookDetailsProps as DefaultBooKDetailsProps
} from "opds-web-client/lib/components/BookDetails";
import ReportProblemLink from "./ReportProblemLink";
import RevokeButton from "./RevokeButton";
import { ComplaintData } from "../interfaces";
import { State } from "../reducers/index";

export interface BookDetailsProps extends DefaultBooKDetailsProps {
  problemTypes: string[];
  fetchComplaintTypes: (url: string) => Promise<string[]>;
  postComplaint: (url: string, data: ComplaintData) => Promise<any>;
}

export class BookDetails extends DefaultBookDetails<BookDetailsProps> {
  constructor(props) {
    super(props);
    this.revoke = this.revoke.bind(this);
  }

  fieldNames() {
    return [
      "Published",
      "Publisher",
      "Audience",
      "Categories",
      "Distributed By"
    ];
  }

  fields() {
    let fields = super.fields();
    let categoriesIndex = fields.findIndex(
      field => field.name === "Categories"
    );
    fields[categoriesIndex].value = this.categories();
    fields.push({
      name: "Audience",
      value: this.audience()
    });
    fields.push({
      name: "Distributed By",
      value: this.distributor()
    });
    return fields;
  }

  audience() {
    if (!this.props.book) {
      return null;
    }

    let categories = this.props.book.raw.category;

    if (!categories) {
      return null;
    }

    let audience = categories.find(
      category =>
        category["$"]["scheme"] &&
        category["$"]["scheme"]["value"] === "http://schema.org/audience"
    );

    if (!audience) {
      return null;
    }

    let audienceStr = audience["$"]["label"] && audience["$"]["label"]["value"];

    if (["Adult", "Adults Only"].indexOf(audienceStr) !== -1) {
      return audienceStr;
    }

    let targetAge = categories.find(
      category =>
        category["$"]["scheme"] &&
        category["$"]["scheme"]["value"] === "http://schema.org/typicalAgeRange"
    );

    if (targetAge) {
      let targetAgeStr =
        targetAge["$"]["label"] && targetAge["$"]["label"]["value"];
      audienceStr += " (age " + targetAgeStr + ")";
    }

    return audienceStr;
  }

  categories() {
    if (!this.props.book) {
      return null;
    }

    let audienceSchemas = [
      "http://schema.org/audience",
      "http://schema.org/typicalAgeRange"
    ];
    let fictionScheme = "http://librarysimplified.org/terms/fiction/";
    let rawCategories = this.props.book.raw.category;

    let categories = rawCategories
      .filter(
        category =>
          category["$"]["label"] &&
          category["$"]["scheme"] &&
          audienceSchemas
            .concat([fictionScheme])
            .indexOf(category["$"]["scheme"]["value"]) === -1
      )
      .map(category => category["$"]["label"]["value"]);

    if (!categories.length) {
      categories = rawCategories
        .filter(
          category =>
            category["$"]["label"] &&
            category["$"]["scheme"] &&
            category["$"]["scheme"]["value"] === fictionScheme
        )
        .map(category => category["$"]["label"]["value"]);
    }

    return categories.length > 0 ? categories.join(", ") : null;
  }

  distributor() {
    if (!this.props.book) {
      return null;
    }

    let rawDistributionTags = this.props.book.raw["bibframe:distribution"];
    if (!rawDistributionTags || rawDistributionTags.length < 1) {
      return null;
    }

    let distributor = rawDistributionTags[0]["$"]["bibframe:ProviderName"];
    if (!distributor) {
      return null;
    }

    return distributor.value;
  }

  reportUrl() {
    let reportLink = this.props.book.raw.link.find(
      link => link["$"]["rel"]["value"] === "issues"
    );

    if (!reportLink) {
      return null;
    }

    return reportLink["$"]["href"]["value"];
  }

  revokeUrl() {
    let revokeLink = this.props.book.raw.link.find(
      link =>
        link["$"]["rel"]["value"] ===
        "http://librarysimplified.org/terms/rel/revoke"
    );

    if (!revokeLink) {
      return null;
    }

    return revokeLink["$"]["href"]["value"];
  }

  revoke() {
    let revokeUrl = this.revokeUrl();
    return this.props.updateBook(revokeUrl);
  }

  circulationLinks() {
    let links = super.circulationLinks();
    if (this.isBorrowed()) {
      links.push(
        <div className="app-info">
          Your book is ready to download in your reading app.
        </div>
      );
    }

    // Books with DRM can only be returned through Adobe,
    // so we don't show revoke links for them.
    if (this.isOpenAccess() && this.revokeUrl()) {
      links.push(
        <RevokeButton
          className="btn btn-default revoke-button"
          revoke={this.revoke}
        >
          Return Now
        </RevokeButton>
      );
    }
    return links;
  }

  rightColumnLinks() {
    let reportUrl = this.reportUrl();
    return reportUrl ? (
      <ReportProblemLink
        className="btn btn-link"
        reportUrl={reportUrl}
        fetchTypes={this.props.fetchComplaintTypes}
        report={this.props.postComplaint}
        types={this.props.problemTypes}
      />
    ) : null;
  }
}

function mapStateToProps(state: State, ownProps) {
  return {
    problemTypes: state.complaints.types
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchComplaintTypes: (url: string) => dispatch(fetchComplaintTypes(url)),
    postComplaint: (url: string, data: ComplaintData) =>
      dispatch(postComplaint(url, data))
  };
}

const ConnectedBookDetails = connect(
  mapStateToProps,
  mapDispatchToProps
)(BookDetails);

export default ConnectedBookDetails;
