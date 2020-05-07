import { NextPage } from "next";
import Collection from "../../components/Collection";

import MultiLibraryPage from "../../components/MultiLibraryPage";
const LibraryHome: NextPage = () => {
  return (
    <MultiLibraryPage showFormatFilter>
      <Collection />
    </MultiLibraryPage>
  );
};

export default LibraryHome;
