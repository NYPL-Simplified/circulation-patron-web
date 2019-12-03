// Ignore imported stylesheets.
// eslint-disable-next-line
const noop = () => {};
require.extensions[".scss"] = noop;
