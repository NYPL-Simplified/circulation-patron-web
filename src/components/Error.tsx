/** @jsx jsx */
import { jsx, Styled } from "theme-ui";

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
  statusCode?: number;
  title?: string;
  detail?: string;
}) => {
  const errorTitle =
    title || statusCodes[statusCode] || "An unexpected error has occurred";

  return (
    <>
      <Styled.h1 sx={{ fontSize: 3, textAlign: `center` }}>
        Error{`: ${errorTitle}`}
      </Styled.h1>
      <p sx={{ textAlign: `center` }}>
        {statusCode
          ? `A ${statusCode} error occurred on server`
          : "An error occurred"}
      </p>
      <p sx={{ textAlign: `center` }}>
        {detail && `${detail}`} <br />
      </p>
    </>
  );
};

export default ErrorComponent;
