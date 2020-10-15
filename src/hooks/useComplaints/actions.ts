import { ComplaintData } from "../../interfaces";

export type ComplaintType = string;

export type ComplaintsAction =
  | {
      type: "FETCH_COMPLAINT_TYPES_REQUEST";
      url: string;
    }
  | {
      type: "FETCH_COMPLAINT_TYPES_SUCCESS";
      types: ComplaintType[];
    }
  | {
      type: "FETCH_COMPLAINT_TYPES_FAILURE";
      error: Error;
    }
  | {
      type: "POST_COMPLAINT_REQUEST";
      url: string;
    }
  | {
      type: "POST_COMPLAINT_SUCCESS";
    }
  | {
      type: "POST_COMPLAINT_FAILURE";
      error: Error;
    }
  | {
      type: "REPORT_PROBLEM";
    }
  | {
      type: "REPORT_PROBLEM_CANCEL";
    };

export function fetchComplaintTypes(
  dispatch: React.Dispatch<ComplaintsAction>
) {
  return (url: string): Promise<string[]> => {
    dispatch({ type: "FETCH_COMPLAINT_TYPES_REQUEST", url });
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => {
          if (response.ok) {
            return response
              .text()
              .then(text => text.split("\n"))
              .catch(_err => {
                throw {
                  status: response.status,
                  response: "Could not parse complaint types",
                  url: url
                };
              });
          } else {
            throw {
              status: response.status,
              response: "Could not fetch complaint types",
              url: url
            };
          }
        })
        .then((types: string[]) => {
          dispatch({ type: "FETCH_COMPLAINT_TYPES_SUCCESS", types });
          resolve(types);
        })
        .catch(err => {
          dispatch({ type: "FETCH_COMPLAINT_TYPES_FAILURE", error: err });
          reject(err);
        });
    });
  };
}

export function postComplaint(dispatch: React.Dispatch<ComplaintsAction>) {
  // returning functions allows us to curry this.
  return (url: string) => (data: ComplaintData): Promise<string[]> => {
    dispatch({ type: "POST_COMPLAINT_REQUEST", url });
    return new Promise((resolve, reject) => {
      const options = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        } as { [index: string]: string },
        body: JSON.stringify(data),
        credentials: "same-origin" as RequestCredentials
      };
      fetch(url, options)
        .then(response => {
          if (response.ok) {
            return;
          } else {
            throw {
              status: response.status,
              response: "Could not post complaint",
              url: url
            };
          }
        })
        .then(() => {
          dispatch({ type: "POST_COMPLAINT_SUCCESS" });
          resolve();
        })
        .catch(err => {
          dispatch({ type: "POST_COMPLAINT_FAILURE", error: err });
          reject(err);
        });
    });
  };
}
