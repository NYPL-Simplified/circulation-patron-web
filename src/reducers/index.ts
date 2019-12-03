import { combineReducers } from "redux";
import complaints, { ComplaintsState } from "./complaints";
import collection, {
  CollectionState
} from "opds-web-client/lib/reducers/collection";

export interface State {
  complaints: ComplaintsState;
  recommendations: CollectionState;
}

export default combineReducers<State>({
  complaints,
  recommendations: collection
});
