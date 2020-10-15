import * as React from "react";

const SvgDownload = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <circle
      cx={12}
      cy={12}
      r={11.647}
      fill="none"
      stroke="currentColor"
      strokeWidth={0.706}
    />
    <path d="M11.667 17.627a.47.47 0 00.666 0l2.995-2.995a.47.47 0 00-.666-.665L12 16.628l-2.662-2.663a.47.47 0 00-.666.666l2.995 2.995zM11.53 6.706v10.588h.942V6.706h-.942z" />
  </svg>
);

export default SvgDownload;
