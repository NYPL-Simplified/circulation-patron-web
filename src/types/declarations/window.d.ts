import { Store, AnyAction } from "redux";
import { State } from "opds-web-client/lib/state";

declare global {
  interface Window {
    __NEXT_REDUX_STORE__: Store<State, AnyAction> | undefined;
  }
}
