import { ComplaintData } from "./interfaces";
require("isomorphic-fetch");

export const FETCH_COMPLAINT_TYPES_REQUEST = "FETCH_COMPLAINT_TYPES_REQUEST";
export const FETCH_COMPLAINT_TYPES_SUCCESS = "FETCH_COMPLAINT_TYPES_SUCCESS";
export const FETCH_COMPLAINT_TYPES_FAILURE = "FETCH_COMPLAINT_TYPES_FAILURE";
export const LOAD_COMPLAINT_TYPES = "LOAD_COMPLAINT_TYPES";

export const POST_COMPLAINT_REQUEST = "POST_COMPLAINT_REQUEST";
export const POST_COMPLAINT_SUCCESS = "POST_COMPLAINT_SUCCESS";
export const POST_COMPLAINT_FAILURE = "POST_COMPLAINT_FAILURE";

export function fetchComplaintTypes(url: string) {
  return (dispatch): Promise<string[]> => {
    dispatch(this.fetchComplaintTypesRequest(url));
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => {
          if (response.ok) {
            return response
              .text()
              .then(text => text.split("\n"))
              .catch(err => {
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
          dispatch(fetchComplaintTypesSuccess());
          dispatch(loadComplaintTypes(types));
          resolve(types);
        })
        .catch(err => {
          dispatch(fetchComplaintTypesFailure(err));
          reject(err);
        });
    });
  };
}

export function fetchComplaintTypesRequest(url: string) {
  return { type: FETCH_COMPLAINT_TYPES_REQUEST, url };
}

export function fetchComplaintTypesSuccess() {
  return { type: FETCH_COMPLAINT_TYPES_SUCCESS };
}

export function fetchComplaintTypesFailure(error) {
  return { type: FETCH_COMPLAINT_TYPES_FAILURE, error };
}

export function loadComplaintTypes(types: string[]) {
  return { type: LOAD_COMPLAINT_TYPES, types };
}

export function postComplaint(url: string, data: ComplaintData) {
  return (dispatch): Promise<string[]> => {
    dispatch(postComplaintRequest(url));
    return new Promise((resolve, reject) => {
      let options = {
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
          dispatch(postComplaintSuccess());
          resolve();
        })
        .catch(err => {
          dispatch(postComplaintFailure(err));
          reject(err);
        });
    });
  };
}

export function postComplaintRequest(url: string) {
  return { type: POST_COMPLAINT_REQUEST, url };
}

export function postComplaintSuccess() {
  return { type: POST_COMPLAINT_SUCCESS };
}

export function postComplaintFailure(error) {
  return { type: POST_COMPLAINT_FAILURE, error };
}
