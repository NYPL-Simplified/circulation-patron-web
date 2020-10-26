/* eslint-disable jsx-a11y/anchor-is-valid */
/** @jsx jsx */
import { jsx } from "theme-ui";
import { H1 } from "./Text";
import { SystemStyleObject } from "@styled-system/css";
import Link from "next/link";
import { getLibrarySlugs } from "dataflow/getLibraryData";
import { useRouter } from "next/router";
import extractParam from "dataflow/utils";
import { OPDS1 } from "interfaces";

const statusCodes: { [code: number]: string } = {
  400: "Bad Request",
  404: "Page Not Found",
  405: "Method Not Allowed",
  500: "Internal Server Error"
};

const ErrorComponent: React.FC<{ info: OPDS1.ProblemDocument }> = ({
  info: { title, status, detail }
}) => {
  const errorTitle = title
    ? title
    : status
    ? statusCodes[status]
    : "An unexpected error has occurred";

  const router = useRouter();
  const library = extractParam(router.query, "library");

  return (
    <div
      sx={{
        p: [3, 4]
      }}
    >
      <H1>
        {status} Error: {errorTitle}
      </H1>
      <p>
        {detail && `${detail}`} <br />
      </p>
      {library ? (
        <Link href={`/${library}`}>
          <a>Return Home</a>
        </Link>
      ) : (
        <LibraryList />
      )}
    </div>
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

const LibraryList: React.FC = () => {
  const libraries = getLibrarySlugs();

  if (!libraries || libraries.length === 0) return null;

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
              <a>/{lib}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorComponent;
