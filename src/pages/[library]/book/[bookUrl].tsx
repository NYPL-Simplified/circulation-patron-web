import { NextPageContext } from "next";
import MultiLibraryPage from "../../../components/MultiLibraryPage";
import BookDetails from "../../../components/bookDetails";
import Layout from "../../../components/Layout";
import { IS_MULTI_LIBRARY } from "../../../utils/env";

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

export async function getServerSideProps(context: NextPageContext) {
  if (!IS_MULTI_LIBRARY && context && context.res) context.res.statusCode = 404;
  return {
    props: {}
  };
}
