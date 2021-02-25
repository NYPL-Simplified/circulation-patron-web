/* eslint-disable jsx-a11y/anchor-is-valid */
/** @jsx jsx */
import { jsx } from "theme-ui";
import { H1 } from "./Text";
import Link from "next/link";
import { useRouter } from "next/router";
import extractParam from "dataflow/utils";
import { OPDS1 } from "interfaces";
import { PageLoader } from "components/LoadingIndicator";

const ErrorComponent: React.FC<{ info?: OPDS1.ProblemDocument }> = ({
  info
}) => {
  const { title = "Something went wrong", status, detail } = info ?? {};

  const router = useRouter();
  const library = extractParam(router.query, "library");

  return (
    //It isn't necessary to show an error page for 401 (Unauthorized) errors since the user will be redirected to the login page
    //Instead, we display a PageLoader to avoid the undesirable display of an error screen while the user waits for that redirect to occur
    <>
      {status === 401 ? (
        <PageLoader />
      ) : (
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
          <Link href={`/${library}`}>
            <a>Return Home</a>
          </Link>
        </div>
      )}
    </>
  );
};

export default ErrorComponent;
