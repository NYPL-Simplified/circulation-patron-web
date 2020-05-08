import { NextPage } from "next";
import Collection from "../components/Collection";

import SingleLibraryPage from "../components/SingleLibraryPage";
import Layout from "../components/Layout";

const LibraryHome: NextPage = () => {
  return (
    <SingleLibraryPage>
      <Layout>
        <Collection />
      </Layout>
    </SingleLibraryPage>
  );
};

export default LibraryHome;
