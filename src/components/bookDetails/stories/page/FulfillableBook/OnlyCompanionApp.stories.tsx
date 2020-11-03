import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import {
  epubFulfillmentLink,
  externalReadFulfillmentLink,
  fulfillableBook,
  unsupportedBook
} from "test-utils/fixtures/book";
import BookPage from "components/bookDetails";

export default {
  title: "Pages/Book/Fulfillable/Only Companion App",
  component: BookPage
} as Meta;

const Template: Story = args => <BookPage {...args} />;

const redirectEpub = {
  ...epubFulfillmentLink,
  supportLevel: "redirect"
};

const redirectExternal = {
  ...externalReadFulfillmentLink,
  supportLevel: "redirect"
};

export const Basic = Template.bind({});
Basic.parameters = {
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

export const WithoutRevokeUrl = Template.bind({});
WithoutRevokeUrl.parameters = {
  ...Basic.parameters,
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
  ...Basic.parameters,
  swr: {
    data: {
      ...unsupportedBook,
      availability: {
        until: "Jun 10 1980"
      }
    }
  }
};
