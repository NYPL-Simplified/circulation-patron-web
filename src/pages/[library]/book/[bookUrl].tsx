import MultiLibraryPage from "../../../components/MultiLibraryPage";
import BookDetails from "../../../components/bookDetails";
import Layout from "../../../components/Layout";

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
