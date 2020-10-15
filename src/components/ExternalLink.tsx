/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { VisuallyHidden } from "reakit";
import { AnchorButton } from "./Button";

const ExternalLink: React.FC<React.ComponentPropsWithoutRef<"a">> = ({
  children,
  ...props
}) => (
  <AnchorButton
    variant="link"
    target="__blank"
    rel="noopener noreferrer"
    {...props}
  >
    {children}
    <VisuallyHidden>(Opens in a new tab)</VisuallyHidden>
  </AnchorButton>
);

export default ExternalLink;
