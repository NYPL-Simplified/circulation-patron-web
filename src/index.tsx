import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
import ContextProvider from "./components/ContextProvider";
import { singleLibraryRoutes, multiLibraryRoutes } from "./routes";

class CirculationPatronWeb {
  constructor(config) {
    let divId = "circulation-patron-web";

    ReactDOM.render(
      <ContextProvider {...config}>
        {config.library.onlyLibrary ? (
          <Router history={browserHistory} routes={singleLibraryRoutes} />
        ) : (
          <Router history={browserHistory} routes={multiLibraryRoutes} />
        )}
      </ContextProvider>,
      document.getElementById(divId)
    );
  }
}

export = CirculationPatronWeb;
