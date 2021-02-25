import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import {
  axisnowFulfillmentLink,
  epubFulfillmentLink,
  externalReadFulfillmentLink,
  fulfillableBook,
  pdfFulfillmentLink,
  unsupportedBook
} from "test-utils/fixtures/book";
import { BookListItem } from "components/BookList";
import { AnyBook } from "interfaces";

export default {
  title: "Components/BookListItem/Fulfillable/Prefers Web App",
  component: BookListItem
} as Meta;

const Template: Story<{ book: AnyBook }> = args => <BookListItem {...args} />;

/**
 * States
 *  - single fulfillment option
 *  - multiple fulfillment options
 *  - no return url
 *  - unsupported
 */

export const DownloadEpub = Template.bind({});
DownloadEpub.args = {
  book: fulfillableBook
};

export const WithAvailability = Template.bind({});
WithAvailability.args = {
  book: {
    ...fulfillableBook,
    availability: {
      until: "Jun 10 1980",
      status: "available"
    }
  }
};

export const AxisNow = Template.bind({});
AxisNow.args = {
  ...DownloadEpub.args,
  book: {
    ...fulfillableBook,
    fulfillmentLinks: [axisnowFulfillmentLink],
    availability: {
      until: "Jun 10 1980",
      status: "available"
    }
  }
};

export const ExternalReadOnline = Template.bind({});
ExternalReadOnline.args = {
  ...DownloadEpub.args,
  book: {
    ...fulfillableBook,
    fulfillmentLinks: [externalReadFulfillmentLink],
    availability: {
      until: "Jun 10 1980",
      status: "available"
    }
  }
};

export const MultipleOptions = Template.bind({});
MultipleOptions.args = {
  ...DownloadEpub.args,
  book: {
    ...fulfillableBook,
    availability: {
      until: "Jun 10 1980",
      status: "available"
    },
    fulfillmentLinks: [
      externalReadFulfillmentLink,
      epubFulfillmentLink,
      pdfFulfillmentLink
    ]
  }
};

export const WithoutRevokeUrl = Template.bind({});
WithoutRevokeUrl.args = {
  ...DownloadEpub.args,
  book: {
    ...fulfillableBook,
    availability: {
      until: "Jun 10 1980",
      status: "available"
    },
    revokeUrl: null
  }
};

export const Unsupported = Template.bind({});
Unsupported.args = {
  ...DownloadEpub.args,
  book: {
    ...unsupportedBook,
    availability: {
      until: "Jun 10 1980",
      status: "available"
    }
  }
};
