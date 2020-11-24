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

const ErrorComponent: React.FC<{ info?: OPDS1.ProblemDocument }> = ({
  info
}) => {
  const { title = "Something went wrong", status, detail } = info ?? {};

  const router = useRouter();
  const isRoot = router.asPath === "/";
  const is404 = status === 404;
  const library = extractParam(router.query, "library");
  const isLibraryRoot = router.pathname === "/[library]";

  return (
    <div
      sx={{
        p: [3, 4]
      }}
    >
      <H1>
        {status} Error: {title}
      </H1>
      <p>
        {detail && `${detail}`} <br />
      </p>
      {isRoot || (isLibraryRoot && is404) ? (
        <LibraryList />
      ) : library && !isLibraryRoot ? (
        <Link href={`/${library}`}>
          <a>Return Home</a>
        </Link>
      ) : null}
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
