/* eslint-disable camelcase */
import { basicAuthMethod } from "./auth";
export const server401Response = {
  public_key: {
    type: "RSA",
    value:
      "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxi8fJ083YYYcMP8a7bFk\nmZM8xCEKmDHDMZzd3/s/ZL2H7EifHJsLv6r+3PL4e+5RQirLanXXfbYujPU92om9\nZQBP7y7rRU+CN+lSCEnMiVEoOIRG5wA34/vjP6mvCGDihVRFwtMRsXZH10ZYRA0H\nOTbLMBjuUJYKHObeXJSIcnppm9Ym8b1s9jO2eoXb02NehjyI6Eqy7WcXBaTLdao+\nT6/SNLs3SG+TEjVUNCx/Dz6Dp4u/ei9NB372carsgYPQLMPJ3c4DeFMo246D9Lzx\nCMh6FQg4BsyH1m7WcdjCBfG9JOHuGNoxLheAjsu/GeYAA5YrNYQ3A5v8fM3p0D5N\nDwIDAQAB\n-----END PUBLIC KEY-----"
  },
  web_color_scheme: { primary: "#ffffff", secondary: "#000000" },
  focus_area: { CA: [], US: [] },
  links: [
    {
      href: "https://tos.examplexyz.com/",
      type: "text/html",
      rel: "terms-of-service"
    },
    {
      href: "https://privacy.examplexyz.com/",
      type: "text/html",
      rel: "privacy-policy"
    },
    {
      href: "https://copyright.examplexyz.com/",
      type: "text/html",
      rel: "copyright"
    },
    { href: "https://about.examplexyz.com/", type: "text/html", rel: "about" },
    {
      href: "https://license.examplexyz.com/",
      type: "text/html",
      rel: "license"
    },
    {
      href: "https://register.examplexyz.com/",
      type: "text/html",
      rel: "register"
    },
    {
      href: "http://test-cm.com/catalogUrl/",
      type: "application/atom+xml;profile=opds-catalog;kind=acquisition",
      rel: "start"
    },
    {
      href: "http://test-cm.com/catalogUrl/loans/",
      type: "application/atom+xml;profile=opds-catalog;kind=acquisition",
      rel: "http://opds-spec.org/shelf"
    },
    {
      href: "http://test-cm.com/catalogUrl/patrons/me/",
      type: "vnd.librarysimplified/user-profile+json",
      rel: "http://librarysimplified.org/terms/rel/user-profile"
    },
    {
      href: "mailto:williams@amigos.org",
      rel: "http://librarysimplified.org/rel/designated-agent/copyright"
    },
    { href: "mailto:williams@amigos.org", type: null, rel: "help" },
    { href: "https://help.examplexyz.com", type: "text/html", rel: "help" },
    { href: "https://www.examplexyz.com", type: "text/html", rel: "alternate" },
    {
      href:
        "http://simplye-dev-web.amigos.org/resources/xyzlib/styles/test-css.css",
      type: "text/css",
      rel: "stylesheet"
    }
  ],
  title: "XYZ Public Library",
  service_area: { CA: [], US: [] },
  authentication: [basicAuthMethod],
  service_description: "Your third place",
  color_scheme: "amber",
  id: "http://test-cm.com/catalogUrl/authentication_document",
  features: {
    disabled: [],
    enabled: ["https://librarysimplified.org/rel/policy/reservations"]
  }
};
