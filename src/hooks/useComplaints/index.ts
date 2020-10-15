import * as React from "react";
import complaints, { initState } from "./reducer";
import { fetchComplaintTypes, postComplaint } from "./actions";
import { useDialogState } from "reakit";
import { AnyBook } from "interfaces";
import { getReportUrl } from "../../utils/libraryLinks";
/**
 * We are using react useReducer instead of redux. The only real difference
 * here is that instead of using redux-thunk, we import the thunk actions
 * here and provide them with dispatch. These thunks take dispatch and return
 * a function to perform an action.
 *
 * eg. const doSomething = dispatch => url => fetch(url);
 *
 * when we call const boundDoSomething = doSomething(dispatch),
 * boundDoSomething is a function we can then use in our app:
 * (url) => fetch(url)
 */
export default function useComplaints(book: AnyBook) {
  const [state, dispatch] = React.useReducer(complaints, initState);
  const dialog = useDialogState();

  const reportUrl = getReportUrl(book.raw);

  // when the hook mounts, fetch the complaint types
  React.useEffect(() => {
    fetchComplaintTypes(dispatch)(reportUrl);
  }, [reportUrl]);

  return {
    state,
    dispatch,
    // this makes it so postComplaint just takes the data.
    postComplaint: postComplaint(dispatch)(reportUrl),
    dialog
  };
}
