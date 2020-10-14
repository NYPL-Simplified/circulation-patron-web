/** @jsx jsx */
import { jsx } from "theme-ui";
import { H1 } from "./Text";
import { SystemStyleObject } from "@styled-system/css";
import Link from "next/link";
import { getLibrarySlugs } from "dataflow/getLibraryData";

const statusCodes: { [code: number]: string } = {
  400: "Bad Request",
  404: "This page could not be found",
  405: "Method Not Allowed",
  500: "Internal Server Error"
};

const ErrorComponent = ({
  statusCode = 404,
  title,
  detail
}: {
  statusCode?: number | null;
  title?: string;
  detail?: string;
}) => {
  const errorTitle = title
    ? title
    : statusCode
    ? statusCodes[statusCode]
    : "An unexpected error has occurred";

  const libraries = getLibrarySlugs();

  return (
    <>
      <H1 sx={{ fontSize: 3, textAlign: `center` }}>
        Error{`: ${errorTitle}`}
      </H1>
      <p sx={{ textAlign: `center` }}>
        {statusCode
          ? `A ${statusCode} error occurred on server`
          : "An error occurred"}
      </p>
      <p sx={{ textAlign: `center` }}>
        {detail && `${detail}`} <br />
      </p>
      {libraries && <LibraryList libraries={libraries} />}
    </>
  );
};

const buttonBase: SystemStyleObject = {
  display: "inline-flex",
  appearance: "none",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  m: 0,
  px: 3,
  border: 0,
  borderRadius: "button",
  cursor: "pointer",
  textDecoration: "none",
  bg: "transparent"
};

const LibraryList: React.FC<{ libraries: string[] }> = ({ libraries }) => {
  return (
    <div>
      <h3>Did you mean to visit one of these?</h3>
      <ul>
        {libraries.map(lib => (
          <li key={lib}>
            <Link
              sx={{
                ...buttonBase,
                display: "block",
                color: "initial",
                textDecoration: "underline",
                cursor: "pointer"
              }}
              href={`/${lib}`}
            >
              {/* nextjs passes the href when cloning the element */}
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a>/{lib}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorComponent;
