import * as React from "react";
import { LibraryData, WebpackAssets, PreloadedData } from "../../interfaces";
import { State } from "opds-web-client/lib/state";
import { renderCSS, renderJS } from "./getAssets";

interface HtmlProps {
  content?: string;
  library: LibraryData;
  preloadedState: State;
  shortenUrls: any;
  assets: WebpackAssets;
  helmetContext: any;
}

const Html = ({
  content,
  library,
  preloadedState,
  shortenUrls,
  assets,
  helmetContext
}: HtmlProps) => {
  const preloadedData: PreloadedData = {
    library,
    shortenUrls,
    initialState: preloadedState
  };

  const { helmet } = helmetContext;
  const htmlAttrs = helmet.htmlAttributes?.toComponent?.();
  const bodyAttrs = helmet.bodyAttributes?.toComponent?.();

  return (
    <html lang="en" {...htmlAttrs}>
      <head>
        {helmet.title?.toComponent?.()}
        {helmet.meta?.toComponent?.()}
        {helmet.link?.toComponent?.()}
        {library.cssLinks?.map(link => (
          <link
            key={link.href}
            href={link.href}
            rel={link.rel}
            crossOrigin="anonymous"
          />
        ))}
        {renderCSS(assets.CirculationPatronWeb)}
        <link
          href="https://fonts.googleapis.com/css?family=Merriweather:400,700|Oswald:300,400,500&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body {...bodyAttrs}>
        <div
          id="circulation-patron-web"
          dangerouslySetInnerHTML={{
            __html: content ? content : ""
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PRELOADED_DATA__=${JSON.stringify(
              preloadedData
            )};`
          }}
          charSet="UTF-8"
        />
        {renderJS(assets.CirculationPatronWeb)}
      </body>
    </html>
  );
};

export const DOCTYPE = "<!DOCTYPE html>";

export default Html;
