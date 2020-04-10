// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as CSS from "csstype";

/**
 * This is a fix for one of the dependencies of Theme-ui being improperly typed and causing errors for us.
 */
declare module "csstype" {
  export type OpacityProperty = Globals | number | "none" | string;
}
