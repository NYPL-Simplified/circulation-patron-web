import * as React from "react";
import { NextPage } from "next";
import { AppProps } from "dataflow/withAppProps";
import { LibraryList } from "components/Error";
import { getLibrarySlugs } from "dataflow/getLibraryData";

const CollectionPage: NextPage<AppProps> = () => {
  const libraries = getLibrarySlugs();
  return (
    <>
      <h1>Open eBooks Home</h1>
      {libraries && <LibraryList libraries={libraries} />};
    </>
  );
};

export default CollectionPage;
