import { SearchData } from "interfaces";
import * as xml2js from "xml2js";
import * as url from "url";

const xmlParser = new xml2js.Parser({ xmlns: true });

/** Converts an open search description document into the application's internal
    representation. */
export default class OpenSearchDescriptionParser {
  parse(xml: string, descriptionUrl: string): Promise<SearchData> {
    return new Promise((resolve, reject) => {
      xmlParser.parseString(xml, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          if (result.OpenSearchDescription) {
            const root = result.OpenSearchDescription;
            const description = root["Description"][0]["_"];
            const shortName = root["ShortName"][0]["_"];
            const templateString = root["Url"][0]["$"].template.value;
            const template = (s: string) => {
              return url.resolve(
                descriptionUrl,
                templateString.replace("{searchTerms}", s)
              );
            };
            resolve({
              searchData: {
                description,
                shortName,
                template
              }
            });
          }
        }
      });
    });
  }
}
