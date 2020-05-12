import * as React from "react";
import MultiLibraryPage from "../../../components/MultiLibraryPage";
import Layout from "../../../components/Layout";
import BookDetails from "../../../components/bookDetails";


const BookPage = () => {
  return (
    <MultiLibraryPage>
      <Layout>
        <BookDetails />
      </Layout>
    </MultiLibraryPage>
  );
};

export default BookPage;
