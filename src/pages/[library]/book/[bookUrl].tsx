import * as React from "react";
import Layout from "../../../components/Layout";
import BookDetails from "../../../components/bookDetails";
import ErrorPage from "../../404";

const BookPage = ({ statusCode }: { statusCode?: number }) => {
  return (
    <Layout>{statusCode === 404 ? <ErrorPage /> : <BookDetails />}</Layout>
  );
};

export default BookPage;
