import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { reservableBook } from "test-utils/fixtures/book";
import BookPage from "components/bookDetails";

export default {
  title: "Pages/Book/Reservable",
  component: BookPage
} as Meta;

const Template: Story = args => <BookPage {...args} />;

export const ReservableBook = Template.bind({});
ReservableBook.parameters = {
  config: {
    companionApp: "openebooks"
  },
  swr: {
    data: reservableBook
  }
};

export const WithAvailability = Template.bind({});
WithAvailability.parameters = {
  ...ReservableBook.parameters,
  swr: {
    data: {
      ...reservableBook,
      copies: {
        available: 0,
        total: 15
      },
      holds: {
        total: 3
      }
    }
  }
};
