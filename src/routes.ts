import CatalogHandler from "./components/CatalogHandler";

export const singleLibraryRoutes = [
  {
    path: "/(collection/:collectionUrl)(/)(book/:bookUrl)",
    component: CatalogHandler
  }
];

export const multiLibraryRoutes = [
  {
    path: "/:library(/)(collection/:collectionUrl)(/)(book/:bookUrl)",
    component: CatalogHandler
  }
];

export default multiLibraryRoutes;
