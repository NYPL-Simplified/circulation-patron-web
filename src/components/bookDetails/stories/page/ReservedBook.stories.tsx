import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { reservedBook } from "test-utils/fixtures/book";
import BookPage from "components/bookDetails";

export default {
  title: "Pages/Book/Reserved",
  component: BookPage
} as Meta;

const Template: Story = args => <BookPage {...args} />;

export const ReservedBook = Template.bind({});
ReservedBook.parameters = {
  config: {
    companionApp: "openebooks"
  },
  swr: {
    data: reservedBook
  }
};

export const WithAvailability = Template.bind({});
WithAvailability.parameters = {
  ...ReservedBook.parameters,
  swr: {
    data: {
      ...reservedBook,
      copies: {
        available: 0,
        total: 15
      },
      holds: {
        total: 3,
        position: 1
      }
    }
  }
};

export const WithoutRevokeUrl = Template.bind({});
WithoutRevokeUrl.parameters = {
  ...WithAvailability.parameters,
  swr: {
    data: {
      ...reservedBook,
      revokeUrl: null,
      copies: {
        available: 0,
        total: 15
      },
      holds: {
        total: 3,
        position: 1
      }
    }
  }
};
