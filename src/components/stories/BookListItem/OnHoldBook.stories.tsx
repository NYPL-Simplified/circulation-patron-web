import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { onHoldBook } from "test-utils/fixtures/book";
import { BookListItem } from "components/BookList";
import { AnyBook } from "interfaces";

export default {
  title: "Components/BookListItem/OnHold",
  component: BookListItem
} as Meta;

const Template: Story<{ book: AnyBook }> = args => <BookListItem {...args} />;

export const OnHoldBook = Template.bind({});
OnHoldBook.args = {
  book: onHoldBook
};

export const WithAvailability = Template.bind({});
WithAvailability.args = {
  book: {
    ...onHoldBook,
    availability: {
      until: "10/20/1980"
    }
  }
};
