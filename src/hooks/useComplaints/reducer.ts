import { ComplaintsAction } from "./actions";

export interface ComplaintsState {
  isFetching: boolean;
  isPosting: boolean;
  types: string[];
  error: any;
  showForm: boolean;
  success: boolean;
}

const resetState = {
  isFetching: false,
  isPosting: false,
  error: null,
  showForm: false,
  success: false
};

export const initState: ComplaintsState = {
  ...resetState,
  types: []
};

export default function complaintsReducer(
  state: ComplaintsState = initState,
  action: ComplaintsAction
): ComplaintsState {
  switch (action.type) {
    case "REPORT_PROBLEM":
      return {
        ...state,
        ...resetState,
        showForm: true
      };
    case "REPORT_PROBLEM_CANCEL":
      return {
        ...state,
        ...resetState,
        showForm: false
      };
    case "FETCH_COMPLAINT_TYPES_REQUEST":
      return Object.assign({}, state, {
        isFetching: true,
        error: null
      });

    case "FETCH_COMPLAINT_TYPES_SUCCESS":
      return Object.assign({}, state, {
        isFetching: false,
        types: action.types
      });

    case "FETCH_COMPLAINT_TYPES_FAILURE":
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error.message
      });

    case "POST_COMPLAINT_REQUEST":
      return Object.assign({}, state, {
        isPosting: true,
        error: null
      });

    case "POST_COMPLAINT_SUCCESS":
      return Object.assign({}, state, {
        isPosting: false,
        success: true
      });

    case "POST_COMPLAINT_FAILURE":
      return Object.assign({}, state, {
        isPosting: false,
        error: action.error.message
      });

    default:
      return state;
  }
}
