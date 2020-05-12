import * as React from "react";
import Layout from "../../components/Layout";
import MyBooks from "../../components/MyBooks";
import MultiLibraryPage from "../../components/MultiLibraryPage";

const Loans = () => {
  return (
    <MultiLibraryPage>
      <Layout>
        <MyBooks />
      </Layout>
    </MultiLibraryPage>
  );
};

export default Loans;
