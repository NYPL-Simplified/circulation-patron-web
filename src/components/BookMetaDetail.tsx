/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

const DetailField: React.FC<{ heading: string; details?: string }> = ({
  heading,
  details
}) =>
  details ? (
    <div sx={{ fontSize: [1, 2] }}>
      <b>{heading}: </b>
      <span>{details}</span>
    </div>
  ) : null;

export default DetailField;
