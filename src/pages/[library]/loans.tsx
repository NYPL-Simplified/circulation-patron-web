import { NextPageContext } from "next";
import MyBooks from "../../components/MyBooks";
import MultiLibraryPage from "../../components/MultiLibraryPage";
import Layout from "../../components/Layout";
import { IS_MULTI_LIBRARY } from "../../utils/env";

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

export async function getServerSideProps(context: NextPageContext) {
  if (!IS_MULTI_LIBRARY && context && context.res) context.res.statusCode = 404;
  return {
    props: {}
  };
}
