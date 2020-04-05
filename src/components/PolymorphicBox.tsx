/** @jsx jsx */
import { jsx } from "theme-ui";
import React from "react";

export interface BoxOwnProps<E extends React.ElementType = React.ElementType> {
  as?: E;
  internalAs?: any;
}

export type BoxProps<E extends React.ElementType> = BoxOwnProps<E> &
  Omit<PropsOf<E>, keyof BoxOwnProps>;

const defaultElement = "div";

/**
 * This component allows us to create components that use an "as" prop
 * with full type-safety. It is somewhat fragile, refer to <Button> to see
 * usage.
 *
 * The internalAs prop is in case the component we want the box to render takes
 * an "as" prop, which is the case when using it to render a link `as={Link}`
 */
// eslint-disable-next-line react/display-name
export const Box = React.forwardRef(
  (
    { as: Element = defaultElement, internalAs, ...restProps }: BoxOwnProps,
    ref: React.Ref<Element>
  ) => {
    return <Element ref={ref} as={internalAs} {...restProps} />;
  }
) as <E extends React.ElementType = typeof defaultElement>(
  props: BoxProps<E>
) => JSX.Element;

// Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
type PropsOf<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>
> = JSX.LibraryManagedAttributes<E, React.ComponentPropsWithRef<E>>;

export type PolymorphicComponentProps<E extends React.ElementType, P> = P &
  BoxProps<E>;
