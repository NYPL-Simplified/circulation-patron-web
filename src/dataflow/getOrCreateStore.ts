/* eslint-disable no-underscore-dangle */
import { State } from "opds-web-client/lib/state";
import buildStore from "opds-web-client/lib/store";
import BasicAuthPlugin from "../auth/basicAuthPlugin";
import samlAuthPlugin from "auth/samlAuthPlugin";
import CleverAuthPlugin from "auth/cleverAuthPlugin";
import { PathFor } from "opds-web-client/lib/interfaces";
import { IS_SERVER, __NEXT_REDUX_STORE__ } from "../utils/env";
/**
 * This function is for use in getInitialProps of the _app component
 * and page components. It creates a new store every time on the
 * server, and on the client it will reuse the store on the window
 */

function getOrCreateStore(pathFor: PathFor, initialState?: State) {
  // Always make a new store if server, otherwise state is shared between requests
  if (IS_SERVER) {
    return buildStore(
      undefined,
      [BasicAuthPlugin, samlAuthPlugin, CleverAuthPlugin],
      pathFor
    );
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = buildStore(
      initialState,
      [BasicAuthPlugin, samlAuthPlugin, CleverAuthPlugin],
      pathFor
    );
  }
  // return our cached store
  return window[__NEXT_REDUX_STORE__];
}

export default getOrCreateStore;
