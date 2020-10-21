import React from "react";
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from "@storybook/react/types-6-0";
import FulfillmentCard from "../FulfillmentCard";
import { AnyBook } from "interfaces";
import { mergeBook } from "test-utils/fixtures/book";

export default {
  title: "Components/FulfillmentCard",
  component: FulfillmentCard
} as Meta;

const Template: Story<{ book: AnyBook }> = args => (
  <FulfillmentCard {...args} />
);

/**
 * States
 *  - All Book States
 *  - Fulfillment
 *    - States
 */

const borrowableBook = mergeBook<BorrowableBookType>({
  status: "borrowable",
  borrowUrl: "/borrow"
});

export const BorrowableBook = Template.bind({});
BorrowableBook.args = {
  book: borrowableBook
};
BorrowableBook.parameters = {
  config: {
    companionApp: "openebooks"
  }
};
