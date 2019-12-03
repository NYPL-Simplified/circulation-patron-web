// Ignore imported stylesheets.
const noop = () => {};
require.extensions[".scss"] = noop;
