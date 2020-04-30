export default {
  id: "xyzlib",
  catalogUrl: "http://simplye-dev-cm.amigos.org/xyzlib",
  catalogName: "XYZ Public Library",
  colors: {
    foreground: "#ffffff",
    background: "#000000"
  },
  headerLinks: [
    {
      href: "https://www.loc.gov/",
      rel: "related",
      type: "text/html",
      title: "LOC",
      role: "navigation"
    }
  ],
  cssLinks: [
    {
      href:
        "http://simplye-dev-web.amigos.org/resources/xyzlib/styles/test-css.css",
      type: "text/css",
      rel: "stylesheet"
    }
  ],
  libraryLinks: {
    tos: {
      href: "https://tos.examplexyz.com/",
      type: "text/html",
      rel: "terms-of-service"
    },
    privacyPolicy: {
      href: "https://privacy.examplexyz.com/",
      type: "text/html",
      rel: "privacy-policy"
    },
    about: {
      href: "https://about.examplexyz.com/",
      type: "text/html",
      rel: "about"
    },
    helpEmail: {
      href: "mailto:williams@amigos.org",
      type: null,
      rel: "help"
    },
    helpWebsite: {
      href: "https://help.examplexyz.com",
      type: "text/html",
      rel: "help"
    },
    libraryWebsite: {
      href: "https://www.examplexyz.com",
      type: "text/html",
      rel: "alternate"
    }
  }
};
