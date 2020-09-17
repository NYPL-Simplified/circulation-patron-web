## CHANGELOG

### Unreleased Changes

- Feature: Add support for Clever auth providers.
- Redesign: in Auth Modal display AuthProvider logos as selectable buttons when there are 2-4 AuthProviders instead of Combobox
- Fix: Update CleverAuth button to use AnchorButton for a11y and semantic reasons
- Fix: Get loans to display on /loans from state.loans instead of state.collection.
- Fix: Removed site-wide navigation from webpub-viewer pages, as it overlapped with the reader. Created a LayoutPage component to wrap pages that require site-wide navigation and update the Page to be used directly for pages that do not require site-wide navigation.
- Add: Remove books from local storage when a user logs out.

# 2.3.0

- Feature: Add support for SAML auth providers.
- Feature: Add confirmation modal to the sign out button.
- Feature: Add `NEXT_PUBLIC_COMPANION_APP` env var (in PR #97) to toggle the display of SimplyE branding. Value can be either `"simplye"` or `"openebooks"`.
- Fix: Don't show search bar if collection does not include search data.
- Fix: Fetch loans on page load when auth credentials are detected so that if you navigate directly to a book you have checked out, it will properly show checked out state.
- Fix: Make BookCover show a better image fallback on image load failure. Also show medium icon on load, and fade image in once it is done loading.
- Fix: Only fetch loans on app start, instead updating our internal store whenever we perform a successful mutation like borrowing a book.
- Fix: Sort My Books by loan date. Open Access content is displayed at the end (bottom).
- Fix: Prevent the current book from appearing in recommendations on book page

## 2.2.1

- Fix: Only show download options for open-access books once they have been borrowed and are present in a user's loans. Download options should still be shown for open-access books in libraries that do not have any auth enabled.
- Fix: Don't perform state update on unmounted `BorrowCard`.
- Refactor: Rename `node` in tests to `utils`, as it is more accurate.
- Fix: Don't show download options for audiobooks since there is no way to play them on desktop. Only show SimplyE callout instead.
- Fix: Update `opds-web-client` dependency to fix browser caching of unwanted Authorization headers.

## 2.2.0

- Redesign: the whole app received a new design based on NYPL Design System.
- Import and use the Card component from NYPL/design-system-react-components.
- Removed the grid view as it seemed redundant with the list view (for now).
- Refactor Buttton to not be polymorphic (ie NavButton and Button and AnchorButton are now completely separate components).

### 2.1.0

- Refactor: Update build configuration and server code to use [Next.js](https://nextjs.org/).
- Refactor: Replace react-router with file-system Next.js routing.
- Add: `.env` file support
- Fix: Correctly send 404s when using one library or multiple.
- Add: Support absolute imports from `src` directory so `../../../components/xxx` becomes `components/xxx`.
- Add: Add next/bundle-analyzer to review bundle sizes.
- Fix: Stop rendering Modal (React Portal) on server
- Update: Update prettier to 2.0
- Removed travis CI as it has been replaced by Github Actions

### 2.0.1

#### Added

- Created Github Actions workflows to test, release, and deploy docker images to Docker Hub for beta and master.

### 2.0.0

#### Breaking Changes

- Implement new designs provided by Amigos
- Replace css with `theme-ui`. Ignore the foreground and background color from the Circulation Manager. Theming functionality will be added back soon.
- Remove OAuth support. This will be added back soon along with SAML.
- Moved the docker files directly in to the repository root.

#### Internal changes

- Decoupled the app from `opds-web-client`. We now import select functionality but essentially render our own app instead of passing custom components in to the `opds-web-client` app.
- Refactored server code and added `webpack-dev-middleware` to enable hot reloading in development.
- Upgraded to stable React context API.
- Switched from Tslint to Eslint. (Tslint is deprecated)
- Upgraded to React Router v4.
- Installed Prettier to automatically format code uniformly before it reaches source control.
- Removed the second redux instance. We used to use a second redux instance for recommendations state and complaints state. Refactored out local redux to use react's `useReducer` and context instead.
- Turned on typescript's [strictNullChecks](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#--strictnullchecks).
- Added `react-axe` for accessibility warnings in development.
- Created numerous hooks that allow re-use of various functionality like auth, linking, etc.
- Switched to Jest and React Testing Library for testing. Legacy test suites are still run with Enzyme.
- Added [Reakit](https://reakit.io/) as an accessible UI component library.

### 1.0.0

#### Updated

- Updated opds-web-client and Typescript to more recent versions.
- Changed the download buttons to remove duplicate mime types and hide unknown mime types.

#### Added

- The application has a docker submodule and Docker images are now automatically built in Docker hub.

### 0.2.2

#### Updated

- Updated documentation explaining how to run the application. Added a separate LICENSE file.

### 0.2.1

#### Added

- `tslint-react-a11y` to review accessibility for React components.

### 0.2.0

#### Updated

- Updating to React 16.

### 0.1.0

#### Updated

- Updated packages include Webpack and Typescript.
- Using `@types` instead of typings.
- Updated unit tests with updated `fetch-mock` package.
