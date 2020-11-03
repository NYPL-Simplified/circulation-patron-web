import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { borrowableBook } from "test-utils/fixtures/book";
import BookPage from "components/bookDetails";

export default {
  title: "Pages/Book/Borrowable",
  component: BookPage
} as Meta;

const Template: Story = args => <BookPage {...args} />;

export const BorrowableBook = Template.bind({});
BorrowableBook.parameters = {
  config: {
    companionApp: "openebooks"
  },
  swr: {
    data: borrowableBook
  }
};

export const WithAvailability = Template.bind({});
WithAvailability.parameters = {
  config: {
    companionApp: "openebooks"
  },
  swr: {
    data: {
      ...borrowableBook,
      copies: {
        available: 50,
        total: 100
      }
    }
  }
};
