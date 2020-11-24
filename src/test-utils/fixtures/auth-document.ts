import { OPDS1 } from "interfaces";

export const authDoc: OPDS1.AuthDocument = {
  id: "auth-doc-id",
  title: "auth doc title",
  description: "auth doc description",
  links: [
    {
      rel: OPDS1.CatalogRootRel,
      href: "/catalog-root"
    }
  ],
  authentication: []
};
