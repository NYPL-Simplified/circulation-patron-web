import Router from "next/router";

/**
 * Mock for the next/Router import.
 */

const mockPush = jest.fn();
Router.push = mockPush;

export default Router;
