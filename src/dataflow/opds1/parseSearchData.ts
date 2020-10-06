import { SearchData } from "interfaces";
import * as xml2js from "xml2js";

const xmlParser = new xml2js.Parser({ xmlns: true });

/** Converts an open search description document into the application's internal
    representation. */
export default async function parseSearchData(
  xml: string,
  descriptionUrl: string
): Promise<SearchData> {
  const result = await xmlParser.parseStringPromise(xml);

  if (result.OpenSearchDescription) {
    const root = result.OpenSearchDescription;
    const description = root["Description"][0]["_"];
    const shortName = root["ShortName"][0]["_"];
    const templateString = root["Url"][0]["$"].template.value.replace(
      "{searchTerms}",
      ""
    );
    const template =
      new URL(templateString, descriptionUrl).toString() + "{searchTerms}";

    return {
      url: descriptionUrl,
      description,
      shortName,
      template
    };
  }

  throw new Error("Could not parse Open Search Description");
}
