import theme from "./theme";
import { SystemStyleObject } from "@styled-system/css";

/**
 * This type will allow an array to also have properties like
 * an object. This is normal JS, and it's usefule when you
 * want to make an array like `radii = [0,3,4]` also have
 * a property like `radii.card = radii[2];` as an alias.
 */
export type Overloadable<T, K> = T & {
  [overload: string]: K;
};

export type ButtonVariants = {
  primary: SystemStyleObject;
  flat: SystemStyleObject;
  accent: SystemStyleObject;
};

export type TextVariants = {};

export type CardVariants = {
  bookDetails: SystemStyleObject;
};

export type Theme = typeof theme;

export default theme;
