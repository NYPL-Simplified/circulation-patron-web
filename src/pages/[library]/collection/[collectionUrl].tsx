import Collection from "../../../components/Collection";
import MultiLibraryPage from "../../../components/MultiLibraryPage";
import Layout from "../../../components/Layout";

const CollectionPage = () => {
  return (
    <MultiLibraryPage>
      <Layout showFormatFilter>
        <Collection />
      </Layout>
    </MultiLibraryPage>
  );
};

export default CollectionPage;
