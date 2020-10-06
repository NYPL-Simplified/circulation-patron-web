import parseSearchData from "../parseSearchData";

describe("OpenSearchDescriptionParser", () => {
  test("parses open search description with absolute url", async () => {
    const result = await parseSearchData(
      `
        <OpenSearchDescription>
          <Description>d</Description>
          <ShortName>s</ShortName>
          <Url template="http://example.com/{searchTerms}" />
        </OpenSearchDescription>
        `,
      "http://example.com"
    );
    expect(result?.description).toBe("d");
    expect(result?.shortName).toBe("s");
    expect(result?.template).toBe("http://example.com/{searchTerms}");
  });

  it("parses open search description with relative url", async () => {
    const result = await parseSearchData(
      `
        <OpenSearchDescription>
          <Description>d</Description>
          <ShortName>s</ShortName>
          <Url template="/{searchTerms}" />
        </OpenSearchDescription>
        `,
      "http://example.com"
    );
    expect(result?.description).toBe("d");
    expect(result?.shortName).toBe("s");
    expect(result?.template).toBe("http://example.com/{searchTerms}");
  });
});
