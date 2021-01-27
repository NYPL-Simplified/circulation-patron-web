/**
 * JSdom doesn't include a stub for the scrollTo function, which we use inside of
 * Lane. Therefore we will stub it globally here
 */

Element.prototype.scrollTo = jest.fn();
window.scrollTo = jest.fn();

export default {};
