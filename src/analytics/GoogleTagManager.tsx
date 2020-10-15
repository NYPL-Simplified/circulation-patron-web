import { APP_CONFIG } from "config";
import * as React from "react";

const GTM_ID = APP_CONFIG.gtmId;

export const GTMScript = () => {
  if (!GTM_ID) return null;
  return (
    <script
      dangerouslySetInnerHTML={{
        __html:
          `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':` +
          `new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],` +
          `j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=` +
          `'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);` +
          `})(window,document,'script','dataLayer','${GTM_ID}');`
      }}
    />
  );
};

export const GTMNoscript = () => {
  if (!GTM_ID) return null;
  return (
    <noscript
      dangerouslySetInnerHTML={{
        __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
      }}
    />
  );
};
