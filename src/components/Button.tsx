/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import { Button as BaseButton } from "reakit";
import * as React from "react";
import { ButtonVariants, VariantProp } from "../interfaces";
import Link from "./Link";
import { Box, PolymorphicComponentProps } from "./PolymorphicBox";

type Variant = VariantProp<ButtonVariants>;
type ButtonOwnProps = {
  variant?: Variant;
  disabled?: boolean;
  className?: string;
};
type ButtonProps<E extends React.ElementType> = PolymorphicComponentProps<
  E,
  ButtonOwnProps
>;

const defaultComponent = BaseButton;

/**
 * renders anything with button styles from the theme. Pass an
 * "as" prop to control the backing component
 */
function Button<E extends React.ElementType = typeof defaultComponent>({
  variant = "primary",
  ...props
}: ButtonProps<E>): JSX.Element {
  return (
    <Box
      as={defaultComponent}
      sx={{ variant: `buttons.${variant}` }}
      {...props}
    />
  );
}

/**
 * The nav button renders a Link, which already takes an "as" prop, so
 * we need to pass that through the PolymorphicBox via some other name
 */
type NavButtonProps = React.ComponentProps<typeof Link> & ButtonOwnProps;
export function NavButton({ as, ...props }: NavButtonProps) {
  return <Button as={Link} internalAs={as} {...props} />;
}

type AnchorButtonProps = React.ComponentProps<typeof Styled.a> & ButtonOwnProps;
export function AnchorButton(props: AnchorButtonProps) {
  return <Button as="a" {...props} />;
}
export default Button;
