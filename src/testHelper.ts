import "./ignore_stylesheet_imports";
import { configure } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

import { jsdom } from "jsdom";

const doc = jsdom("<!doctype html><html><body></body></html>");
const win = doc.defaultView;

global["document"] = doc;
global["window"] = win;

Object.keys(window).forEach(key => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});
