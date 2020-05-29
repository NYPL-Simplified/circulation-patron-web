import * as React from "react";
import MyBooks from "../../components/MyBooks";

import Layout from "../../components/Layout";
import ErrorPage from "../404";

const Loans = ({ statusCode }: { statusCode?: number }) => {
  return <Layout>{statusCode === 404 ? <ErrorPage /> : <MyBooks />}</Layout>;
};

export default Loans;
