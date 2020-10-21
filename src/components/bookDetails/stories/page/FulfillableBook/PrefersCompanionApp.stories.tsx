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
  title: "Pages/Book/Fulfillable/Prefers Companion App",
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

const redirectEpub = {
  ...epubFulfillmentLink,
  supportLevel: "redirect-and-show"
};

const redirectAxisNow = {
  ...axisnowFulfillmentLink,
  supportLevel: "redirect-and-show"
};

const redirectExternal = {
  ...externalReadFulfillmentLink,
  supportLevel: "redirect-and-show"
};

const redirectPdf = {
  ...pdfFulfillmentLink,
  supportLevel: "redirect-and-show"
};

export const DownloadEpub = Template.bind({});
DownloadEpub.parameters = {
  config: {
    companionApp: "openebooks"
  },
  swr: {
    data: {
      ...fulfillableBook,
      fulfillmentLinks: [redirectEpub]
    }
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
      },
      fulfillmentLinks: [redirectEpub]
    }
  }
};

export const AxisNow = Template.bind({});
AxisNow.parameters = {
  ...DownloadEpub.parameters,
  swr: {
    data: {
      ...fulfillableBook,
      availability: {
        until: "Jun 10 1980"
      },
      fulfillmentLinks: [redirectAxisNow]
    }
  }
};

export const ExternalReadOnline = Template.bind({});
ExternalReadOnline.parameters = {
  ...DownloadEpub.parameters,
  swr: {
    data: {
      ...fulfillableBook,
      availability: {
        until: "Jun 10 1980"
      },
      fulfillmentLinks: [redirectExternal]
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
      fulfillmentLinks: [redirectExternal, redirectEpub, redirectPdf]
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
      fulfillmentLinks: [redirectEpub, redirectExternal],
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
