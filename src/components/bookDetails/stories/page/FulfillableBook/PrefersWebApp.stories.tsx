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
import BookPage from "components/bookDetails";

export default {
  title: "Pages/Book/Fulfillable/Prefers Web App",
  component: BookPage
} as Meta;

const Template: Story = args => <BookPage {...args} />;

/**
 * States
 *  - One "show" fulfillment
 *  - Multiple "show" fulfillments
 *  - One "redirect-and-show" fulfillment
 *  - Multiple "redirect-and-show" fulfillments
 *  - One "redirect" fulfillment
 *  - With revokeUrl
 *  - Without revokeUrl
 */

export const DownloadEpub = Template.bind({});
DownloadEpub.parameters = {
  config: {
    companionApp: "openebooks"
  },
  swr: {
    data: fulfillableBook
  }
};

export const WithAvailability = Template.bind({});
WithAvailability.parameters = {
  config: {
    companionApp: "openebooks"
  },
  swr: {
    data: {
      ...fulfillableBook,
      availability: {
        until: "Jun 10 1980"
      }
    }
  }
};

export const AxisNow = Template.bind({});
AxisNow.parameters = {
  ...DownloadEpub.parameters,
  swr: {
    data: {
      ...fulfillableBook,
      fulfillmentLinks: [axisnowFulfillmentLink],
      availability: {
        until: "Jun 10 1980"
      }
    }
  }
};

export const ExternalReadOnline = Template.bind({});
ExternalReadOnline.parameters = {
  ...DownloadEpub.parameters,
  swr: {
    data: {
      ...fulfillableBook,
      fulfillmentLinks: [externalReadFulfillmentLink],
      availability: {
        until: "Jun 10 1980"
      }
    }
  }
};

export const MultipleOptions = Template.bind({});
MultipleOptions.parameters = {
  ...DownloadEpub.parameters,
  swr: {
    data: {
      ...fulfillableBook,
      availability: {
        until: "Jun 10 1980"
      },
      fulfillmentLinks: [
        externalReadFulfillmentLink,
        epubFulfillmentLink,
        pdfFulfillmentLink
      ]
    }
  }
};

export const WithoutRevokeUrl = Template.bind({});
WithoutRevokeUrl.parameters = {
  ...DownloadEpub.parameters,
  swr: {
    data: {
      ...fulfillableBook,
      availability: {
        until: "Jun 10 1980"
      },
      revokeUrl: null
    }
  }
};

export const Unsupported = Template.bind({});
Unsupported.parameters = {
  ...DownloadEpub.parameters,
  swr: {
    data: {
      ...unsupportedBook,
      availability: {
        until: "Jun 10 1980"
      }
    }
  }
};
