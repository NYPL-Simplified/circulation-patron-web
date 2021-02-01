/* eslint-disable jsx-a11y/anchor-is-valid */
/** @jsx jsx */
import { jsx } from "theme-ui";
import { H1 } from "./Text";
import Link from "next/link";
import { useRouter } from "next/router";
import extractParam from "dataflow/utils";
import { OPDS1 } from "interfaces";

const ErrorComponent: React.FC<{ info?: OPDS1.ProblemDocument }> = ({
  info
}) => {
  const { title = "Something went wrong", status, detail } = info ?? {};

  const router = useRouter();
  const library = extractParam(router.query, "library");

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
      <Link href={`/${library}`}>
        <a>Return Home</a>
      </Link>
    </div>
  );
};

export default ErrorComponent;
