/** @jsx jsx */
import { jsx } from "theme-ui";
import { Button as BaseButton } from "reakit";
import * as React from "react";
import Link, { LinkProps } from "../Link";
import { styleProps } from "./styles";
import LoadingIndicator from "components/LoadingIndicator";
import { Text } from "components/Text";

export type ButtonVariant = "filled" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";
type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: string;
  className?: string;
  iconLeft?: React.ComponentType;
  iconRight?: React.ComponentType;
};

/**
 * We provide three buttons that look the same, but operate differently:
 *  - Button: Renders an HTML button
 *  - NavButton: Renders a Link
 *  - AnchorButton: Renders an HTML anchor
 */
type ButtonProps = React.ComponentPropsWithoutRef<typeof BaseButton> &
  ButtonOwnProps & {
    disabled?: boolean;
    loading?: boolean;
    loadingText?: string;
  };
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function (
  props,
  ref
) {
  const {
    variant = defaultVariant,
    color = defaultColor,
    size = defaultSize,
    loading,
    loadingText,
    disabled,
    iconLeft,
    iconRight,
    ...rest
  } = props;

  return (
    <BaseButton
      sx={styleProps(color, size, variant)}
      disabled={loading || disabled}
      ref={ref}
      aria-label={loading && loadingText ? loadingText : undefined}
      {...rest}
    >
      <ButtonContent {...props} />
    </BaseButton>
  );
});

const ButtonContent: React.FC<
  ButtonProps | NavButtonProps | AnchorButtonProps
> = ({ iconLeft: IconLeft, iconRight: IconRight, children, ...rest }) => {
  const loading = "loading" in rest ? rest.loading : false;
  const loadingText = "loadingText" in rest ? rest.loadingText : undefined;
  return (
    <>
      {!loading && IconLeft && <IconLeft sx={{ mr: 1, ml: -1 }} />}
      {!loading && children}
      {!loading && IconRight && <IconRight sx={{ mr: -1, ml: 1 }} />}
      {loading && (
        <LoadingIndicator
          color="ui.gray.extraDark"
          size={18}
          sx={{
            ml: loadingText ? -2 : undefined,
            mr: loadingText ? 2 : undefined
          }}
        />
      )}
      {loading && loadingText && <Text>{loadingText}</Text>}
    </>
  );
};
/**
 * The nav button renders a Link, which already takes an "as" prop, so
 * we need to pass that through the PolymorphicBox via some other name
 */
type NavButtonProps = LinkProps & ButtonOwnProps;
export const NavButton = React.forwardRef<HTMLAnchorElement, NavButtonProps>(
  function (props, ref) {
    const {
      variant = defaultVariant,
      color = defaultColor,
      size = defaultSize,
      iconLeft,
      iconRight,
      ...rest
    } = props;
    return (
      <Link sx={styleProps(color, size, variant)} ref={ref} {...rest}>
        <ButtonContent {...props} />
      </Link>
    );
  }
);

type AnchorButtonProps = React.ComponentPropsWithoutRef<"a"> &
  ButtonOwnProps & { newTab?: boolean };
export const AnchorButton = React.forwardRef<
  HTMLAnchorElement,
  AnchorButtonProps
>(function (props, ref) {
  const {
    color = defaultColor,
    size = defaultSize,
    variant = defaultVariant,
    newTab,
    iconLeft,
    iconRight,
    ...rest
  } = props;
  return (
    <a
      sx={styleProps(color, size, variant)}
      rel={newTab ? "noreferrer noopener" : undefined}
      target={newTab ? "__blank" : undefined}
      ref={ref}
      {...rest}
    >
      <ButtonContent {...props} />
    </a>
  );
});

const defaultVariant = "filled";
const defaultColor = "brand.primary";
const defaultSize = "md";

export default Button;
