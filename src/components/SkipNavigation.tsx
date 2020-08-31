/** @jsx jsx */
import { jsx } from "theme-ui";
import { CONTENT_ID } from "./Layout";

/**
 * Renders a link that is hidden until focused to skip to main content
 */
const SkipNavigation = () => (
  <a
    href={`#${CONTENT_ID}`}
    sx={{
      clip: "rect(0 0 0 0)",
      border: 0,
      height: 1,
      width: 1,
      m: -1,
      p: 0,
      overflow: "hidden",
      position: "absolute",
      top: -9999,
      ":focus": {
        p: 3,
        position: "fixed",
        zIndex: "skipNavigation",
        top: 10,
        left: 10,
        m: 2,
        fontWeight: "bold",
        bg: "white",
        width: "auto",
        height: "auto",
        clip: "auto"
      }
    }}
  >
    Skip to content
  </a>
);

export default SkipNavigation;
