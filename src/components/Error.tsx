/** @jsx jsx */
import { jsx } from "theme-ui";
import { H1 } from "./Text";
import Router from "next/router";
import { SystemStyleObject } from "@styled-system/css";
import { AppConfigFile } from "interfaces";

const statusCodes: { [code: number]: string } = {
  400: "Bad Request",
  404: "This page could not be found",
  405: "Method Not Allowed",
  500: "Internal Server Error"
};

const ErrorComponent = ({
  statusCode = 404,
  title,
  detail,
  configFile
}: {
  statusCode?: number | null;
  title?: string;
  detail?: string;
  configFile?: AppConfigFile | null;
}) => {
  const errorTitle = title
    ? title
    : statusCode
    ? statusCodes[statusCode]
    : "An unexpected error has occurred";
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
      {configFile && <LibraryList configFile={configFile} />}
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

const LibraryList: React.FC<{ configFile: AppConfigFile }> = ({
  configFile
}) => {
  const libraries = Object.keys(configFile);

  const loadPage = async (lib: string) => {
    await Router.push("/[library]", `/${lib}`);
    Router.reload();
  };

  return (
    <div>
      <h3>Did you mean to visit one of these?</h3>
      <ul>
        {libraries.map(lib => (
          <li key={lib}>
            <button
              sx={{
                ...buttonBase,
                display: "block",
                color: "initial",
                textDecoration: "underline",
                cursor: "pointer"
              }}
              onClick={() => loadPage(lib)}
            >
              /{lib}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorComponent;
