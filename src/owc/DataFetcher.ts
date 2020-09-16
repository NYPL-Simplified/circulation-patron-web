import OPDSParser, { OPDSFeed, OPDSEntry } from "opds-feed-parser";
import OpenSearchDescriptionParser from "./OpenSearchDescriptionParser";

export interface RequestError {
  status: number | null;
  response: string;
  url: string;
  headers?: any;
}

export interface RequestRejector {
  (err: RequestError): any;
}

export interface DataFetcherConfig {
  /** If `proxyUrl` is provided, requests will be posted to the proxy url instead
      of the original url, to get around CORS restrictions. The proxy server should
      get the original url out of the form data, make the request, and return
      the response. */
  proxyUrl?: string;

  /** Function to convert OPDS data to an internal format needed by the application. */
  adapter?: (data: OPDSFeed | OPDSEntry, url: string) => any;
}

/** Handles requests to OPDS servers. */
export default class DataFetcher {
  public authKey: string;
  private proxyUrl?: string;
  private adapter?: (data: OPDSFeed | OPDSEntry, url: string) => any;

  constructor(config: DataFetcherConfig = {}) {
    this.proxyUrl = config.proxyUrl;
    this.adapter = config.adapter;
    this.authKey = "authCredentials";
  }

  fetchOPDSData(url: string) {
    const parser = new OPDSParser();

    if (!this.adapter) {
      return Promise.reject({
        status: null,
        response: "No adapter has been configured in DataFetcher.",
        url
      });
    }

    return new Promise((resolve, reject: RequestRejector) => {
      this.fetch(url)
        .then(response => {
          response
            .text()
            .then(text => {
              if (this.isErrorCode(response.status)) {
                reject({
                  status: response.status,
                  response: text,
                  url: url,
                  headers: response.headers
                });
              }

              parser
                .parse(text)
                .then((parsedData: OPDSFeed | OPDSEntry) => {
                  resolve(this.adapter?.(parsedData, url));
                })
                .catch(_err => {
                  reject({
                    status: null,
                    response: "Failed to parse OPDS data",
                    url: url
                  });
                });
            })
            .catch(error => {
              reject({
                status: response.status,
                response: error.message,
                url: url,
                headers: response.headers
              });
            });
        })
        .catch(error => reject(error));
    });
  }

  fetchSearchDescriptionData(searchDescriptionUrl: string) {
    const parser = new OpenSearchDescriptionParser();

    return new Promise((resolve, reject: RequestRejector) => {
      this.fetch(searchDescriptionUrl)
        .then(response => {
          response.text().then(text => {
            if (this.isErrorCode(response.status)) {
              reject({
                status: response.status,
                response: text,
                url: searchDescriptionUrl
              });
            }

            parser
              .parse(text, searchDescriptionUrl)
              .then(openSearchDescription => {
                resolve(openSearchDescription);
              })
              .catch(_err => {
                reject({
                  status: null,
                  response: "Failed to parse OPDS data",
                  url: searchDescriptionUrl
                });
              });
          });
        })
        .catch(reject);
    });
  }

  fetch(url: string, options: any = {}) {
    options = Object.assign({ credentials: "same-origin" }, options);

    if (this.proxyUrl) {
      const formData = new (window as any).FormData();
      formData.append("url", url);
      Object.assign(options, {
        method: "POST",
        body: formData
      });
      url = this.proxyUrl;
    }

    options["headers"] = this.prepareAuthHeaders(options["headers"]);

    return fetch(url, options);
  }

  prepareAuthHeaders(headers: any = {}): any {
    // server needs to know request came from JS in order to omit
    // 'Www-Authenticate: Basic' header, which triggers browser's
    // ugly basic auth popup
    headers["X-Requested-With"] = "XMLHttpRequest";

    return headers;
  }

  isErrorCode(status: number) {
    return status < 200 || status >= 400;
  }
}
