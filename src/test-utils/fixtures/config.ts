import { AppConfig } from "interfaces";

export const config: AppConfig = {
  instanceName: "Test Instance",
  gtmId: null,
  bugsnagApiKey: null,
  companionApp: "simplye",
  showMedium: true,
  openebooks: null,
  libraries: {
    lib1: { title: "lib1", authDocUrl: "http://lib1.com" }
  },
  mediaSupport: {
    "application/epub+zip": "show",
    "application/kepub+zip": "show",
    "application/pdf": "show",
    "application/x-mobipocket-ebook": "show",
    "application/x-mobi8-ebook": "show",
    "application/vnd.overdrive.circulation.api+json;profile=ebook": "show",
    // # External read online type (Like Overdrive)
    'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"':
      "show",
    // # AxisNow document (read online in Webpub Viewer)
    "application/vnd.librarysimplified.axisnow+json": "show",
    // # Audiobooks
    "application/audiobook+json": "redirect",
    "application/vnd.overdrive.circulation.api+json;profile=audiobook":
      "redirect",
    // # INDIRECT TYPES
    // # OPDS Entry Indirection type
    "application/atom+xml;type=entry;profile=opds-catalog": {
      'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"':
        "show"
    },
    // # Adobe Encryption
    "application/vnd.adobe.adept+xml": {
      "application/epub+zip": "redirect-and-show"
    }
    // # Bearer Token Exchange
    // # application/vnd.librarysimplified.bearer-token+json:
  }
};
