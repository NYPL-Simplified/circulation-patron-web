/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

const DetailField: React.FC<{
  heading: string;
  details?: string;
  className?: string;
}> = ({ heading, details, className }) =>
  details ? (
    <div className={className}>
      <b>{heading}: </b>
      <span>{details}</span>
    </div>
  ) : null;

export default DetailField;
