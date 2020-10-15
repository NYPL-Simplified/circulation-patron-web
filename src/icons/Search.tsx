import * as React from "react";

const SvgSearch = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-1.671 7.743A9.958 9.958 0 0110 20C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10a9.958 9.958 0 01-2.257 6.329l5.96 5.96a1 1 0 01-1.414 1.414l-5.96-5.96z"
    />
  </svg>
);

export default SvgSearch;
