import MyBooks from "../../components/MyBooks";
import MultiLibraryPage from "../../components/MultiLibraryPage";
import Layout from "../../components/Layout";

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
