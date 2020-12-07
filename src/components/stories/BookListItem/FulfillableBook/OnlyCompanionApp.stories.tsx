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
  title: "Components/BookListItem/Fulfillable/Only Companion App",
  component: BookListItem
} as Meta;

const Template: Story<{ book: AnyBook }> = args => <BookListItem {...args} />;

const redirectEpub = {
  ...epubFulfillmentLink,
  supportLevel: "redirect"
} as const;

const redirectAxisNow = {
  ...axisnowFulfillmentLink,
  supportLevel: "redirect"
} as const;

const redirectExternal = {
  ...externalReadFulfillmentLink,
  supportLevel: "redirect"
} as const;

const redirectPdf = {
  ...pdfFulfillmentLink,
  supportLevel: "redirect"
} as const;

export const DownloadEpub = Template.bind({});
DownloadEpub.args = {
  book: {
    ...fulfillableBook,
    fulfillmentLinks: [redirectEpub]
  }
};

export const WithAvailability = Template.bind({});
WithAvailability.args = {
  book: {
    ...fulfillableBook,
    fulfillmentLinks: [redirectEpub],
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
    fulfillmentLinks: [redirectAxisNow],
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
    fulfillmentLinks: [redirectExternal],
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
    fulfillmentLinks: [redirectExternal, redirectEpub, redirectPdf]
  }
};

export const WithoutRevokeUrl = Template.bind({});
WithoutRevokeUrl.args = {
  ...DownloadEpub.args,
  book: {
    ...fulfillableBook,
    fulfillmentLinks: [redirectPdf],
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
