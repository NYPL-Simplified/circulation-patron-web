# circulation-patron-web

<div>
  <a aria-label="Docker images" href="https://hub.docker.com/r/nypl/patron-web/tags">
    <img alt="Docker Image Version (latest semver)" src="https://img.shields.io/docker/v/nypl/patron-web?label=Docker%20Hub&logo=docker&sort=semver">
  </a>
  <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/nypl-simplified/circulation-patron-web/CI?label=Tests&logo=github">
  <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/nypl-simplified/circulation-patron-web/Production Release?label=Build%20%28master%29&logo=github">
  <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/nypl-simplified/circulation-patron-web/Publish beta?label=Build%20%28beta%29&logo=github">
</div>

An OPDS web catalog client for library patrons.

## Background

The `circulation-patron-web` application serves as a way for libraries to publish their collections to the web. A library _must_ be part of a [Circulation Manager](https://github.com/NYPL-Simplified/circulation) and _can_ be registered to a [Library Registry](https://github.com/NYPL-Simplified/library_registry). Currently, in order for a library to be part of Library Simplified and show up in the SimplyE application, they must register with NYPL's Library Registry. A Library Registry provides details about a library, and a Circulation Manager provides a library's collection of eBooks and audiobooks in OPDS format.

This app can support many libraries, each at their own url: `http://example.com/library1` can be one library, and `http://example.com/library2` another library. You configure the libraries for the app in the [config file](#configuration-file).

# Configuring the application

## Configuration File

To deploy the application, there are a few configuration variables that need to be set up. Most notably, the app needs to know what libraries to support and the url for each library's Circulation Manager backend. This is called the catalog root url, and each library the app runs has a unique catalog root url. Additionally, the app needs to know which media formats to support, and how. Finally, there are a few other variables that can be configured. 

The production configuration is defined in a YAML config file. You can find more details on the options in the `sample-config.yml` file. To run the app, you must tell it where to find the config file. This is done via the `CONFIG_FILE` environment variable. See [environment variables](#environment-variables) below for more information.

## Environment Variables

The main app configuration is done in the [config file](#configuration-file), but where to find that file is defined as an environment variable, along with some other optional variables that may be useful for development. These can either be set at the command line when running the application, or in a `.env.local` file. 

Setting via the command line:
```
> CONFIG_FILE=config.yml npm run start
```

Setting in a `.env.local` file:
```
CONFIG_FILE=config.yml
```
The app can then be run with `npm run start`, and it will pick up the env from your env file.

The following environment variables can be set to further configure the application.

- Set `AXE_TEST=true` to run the application with `react-axe` enabled (only works when `NODE_ENV` is "development").
- Set `ANALYZE=true` to generate bundle analysis files inside `.next/analyze` which will show bundle sizes for server and client, as well as composition.
- Set `NEXT_PUBLIC_AXISNOW_DECRYPT=true` to indicate that the build environment has access to the axisnow decryptor submodule. Default is false.

## Manager, Registry, and Application Configurations

Any Circulation Manager you'll be using with the app also needs a configuration setting to turn on CORS headers. In the Circulation Manager interface, go to the Sitewide Settings section under System Configuration (`/admin/web/config/sitewideSettings`) and add a setting for "URL of the web catalog for patrons". For development, you can set this to "\*", but for production it should be the real URL where you will run the catalog.

If you are using a Library Registry, this configuration will automatically be created when you register libraries with the Registry, but you need to configure the URL in the Library Registry by running `bin/configuration/configure_site_setting --setting="web_client_url=http://library.org/{uuid}"` (replace the URL with your web client URL). Otherwise, you'll need to create a sitewide setting for it in the Circulation Manager. Finally, make sure that the libraries are registered to the Library Registry you are using.


# Development

We use [Next.js](https://nextjs.org/) as our react framework. This handles build configuration as well as server management, providing simple APIs to allow server-rendering or even static-rendering

## Installing Dependencies

Run `npm install` in this repository to install the dependencies. If you get errors, you may be using the wrong Node version. We define our node version in `.nvmrc`. You can use [Node Version Manager](https://github.com/nvm-sh/nvm) to pick that up or manually install that version. It's possible that older versions will work, but the version in `.nvmrc` is the version all our tests and QA are run on.

## Running the Application

Once the dependencies are installed and application environments configured, the following two base commands can be used to start the application:

- `npm run dev` - This command will start the development server, which builds pages lazily (when you request them) to shorten the startup time.
- `npm run dev:https` - This will run the app in development with https enabled. This uses the `dev-server.js` script to load https keys. It's useful when developing features that require https to be enabled.
- `npm run build` - This will build both the server and the client code into `./next`. You can then run `npm run start` to start the server.

The application will start at the base URL of `localhost:3000`.

### Running with Decryption

This app supports read online for encrypted books only in the AxisNow format, and if you have access to the [Decryptor](https://github.com/NYPL-Simplified/axisnow-access-control-web)

To run with decryption:  
- Set `axisnow_decrypt=true` in your app's `config.yml` file.
- Run `git submodule update`
- Verify that `axisnow-access-control-web` folder exists.  
- Run `npm install` as normal.

### ENV Vars and Building

When building for production using `npm run build`, the env vars are set at build time. This means whatever you have in your `.env` or `.env.local` or set in the command line when running `npm run build` will be taken as the env for the app when you run it. Overriding env vars like this `CONFIG_FILE=config.txt npm run start` will not work, you have to set them at build time.

### Useful Scripts

- `npm run test` - This will launch the test runner (jest) and run all tests.
- `npm run test:watch` - This will run jest in watch mode, rerunning and affected tests whenever you save a file. It's recommended to have this running when developing, that way you know immediately when a change causes some test to fail.
- `npm run dev:axe` - Will run the dev script with react-axe enabled for viewing accessibility issues.
- `npm run lint` - Will lint all code and show errors/warnings in the console.
- `npm run lint:ts:fix` - Will lint the ts and tsx files and apply automatic fixes where possible.
- `npm run generate-icons` - You can place svg files in `src/icons` and then run this command, and it will generate react components that can be imported and rendered normally.

## Contributing

There are two protected branches in this repository: `beta`, and `master`.

- `master` is the most current production deployment code. Any time a PR is merged in to master, a release is tagged and created. A Docker Image is then built by Github Actions, which is finally pushed to Docker Hub with the tag `latest` as well as the specific version tag of the release (ie `2.3.6`). Generally, we only make PRs to `master` from `beta` unless a hotfix is necessary in production.
- `beta` is the development and qa branch where feature PRs are brought together and staged/tried before being pushed into production. This is the default branch that most PRs should be pointed to. It is also tested, built and deployed by Github Actions with the tag `beta` and `beta.short_sha` where `short_sha` is from the most recent commit to beta. This way users can install the most recent beta using `beta` tag, or one at a specific commit for testing purposes.

## Testing

The code is tested using Jest as a test runner and mocking library, and a combination of [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) and [Enzyme](https://enzymejs.github.io/enzyme/). New tests are generally written with React Testing Library while the legacy tests were written with Enzyme. React Testing Library is good because it encourages devs not to test implementation details, but instead test the expected user experience. This results in tests that provide more confidence and change less frequently (they are implementation agnostic), therefore requiring less maintenance. In general, we have favored integration over unit tests, and testing components higher up the tree instead of in complete isolation. Similarly we have chosen to mock as few values and modules as possible. Both of these decisions will lead to higher confidence that the app works as expected for users.

We do use snapshot testing in a few places. The general idea is to limit usage of snapshot testing to relatively small UI components where you essentially want to just make sure the UI doesn't change unexpectedly. When a snapshot test fails, the diff will be shown in the terminal. If the diff is the expected result of a change you made, you can update the failing snapshots to the new value by pressing `u` in the CLI.

### Context and useful spies

Because many components depend on context values, such as the redux store or the theme, the `src/test-utils/index.tsx` file augments React Testing Library's `render` function to wrap the passed in component with our standard context providers. The custom `render` function also provides a way to pass in an `initialState` so you can set the redux state at the time of render in the test. We also mock and/or spy on some values, such as `pathFor`, and redux's `dispatch`, the latter of which is passed to the test in the `render` result so it can be asserted on.

Inside of `src/test-utils/fixtures` are some useful data fixtures. Typically they are used to create an initial state for the application which is passed as an option to the render function.

### Running tests

You can run `npm run test` to run the test suite once. Alternatively, and recommended, is keeping the test suite running in watch mode while developing with `npm run test:watch`. The CLI output for that function will also provide instructions to filter the tests to a specific file for speed, if you'd like.

### Example

An annotated example from `Search.text.tsx`:

```js
/**
 *  our custom render, our fixtures, the actions creator, and
 *  all other react-testing-library exports can be imported from test-utils
 */
import { render, fixtures, fireEvent, actions } from "../../test-utils";

test("fetches search description", async () => {
  /**
   * use merge to create an initial state specific for this test. Merge is useful
   * not only because it will deep merge the objects, but it copies them to a new
   * object, so if the app alters the passed in state object, it won't break other
   * tests that rely on it. This is a common source of flakiness where one test fails
   * only if another one runs. Merge should solve it.
   */
  const initialState: State = merge(fixtures.initialState, {
    collection: {
      data: {
        search: {
          url: "/search-url"
        }
      }
    }
  });

  // spy on a specific action in the ActionsCreator.
  const mockedFetchSearchDescription = jest.spyOn(
    actions,
    "fetchSearchDescription"
  );
  /**
   * utils will contain
   *  - the result of render
   *  - the redux store
   *  - the history object
   *  - the spied on dispatch function
   */
  const utils = render(<Search />, {
    initialState
  });

  expect(mockedFetchSearchDescription).toHaveBeenCalledTimes(1);
  expect(mockedFetchSearchDescription).toHaveBeenCalledWith("/search-url");
  // we can assert on the app's dispatch like this
  expect(utils.dispatch).toHaveBeenCalledTimes(1);
});
```

## Links and Routing

When creating links using `<Link>`, you don't need to worry about whether it is for a single or multi-library route config. Write the `as` and `href` like you would if the package only supported one-library setups, and the `<Link>` will prepend `/[libraryId]` to your routes if needed.

# Deploying

This repository includes a Dockerfile, and the master branch is built as an image in Docker Hub in the Hub repository [nypl/patron-web](https://hub.docker.com/r/nypl/patron-web). You can deploy the application simply by running the image from Docker Hub. You can either use the `latest` tag in Docker Hub, or a specific version tagged with the version number. There will also be an image tagged `beta` for the most recent code on the `beta` branch.

Alternatively, you can build your own container from local changes as described below. If you would like to deploy from Docker Hub, skip to [Running a container from the image](#running-a-container-from-the-image).

## Build a docker container

When you have code changes you wish to review locally, you will need to build a local Docker image with your changes included. There are a few steps to get a working build:

1. Clone this repository and make some changes.

2. Build the image
   ```
   docker build -t patronweb  .
   ```

If you wanted to customize the image, you could create an additional Dockerfile (e.g., Dockerfile.second) and simply specify its name in the docker build commands. The Docker file you specify will guide the image build. For this image, the build takes about 4-6 minutes, depending on your Internet speed and load on the Node package servers, to complete the final image. Eg: `docker build -f Dockerfile.second -t patronweb .`

### Running the docker container

Whether running the container from a Docker Hub image, or a local one, you will need to provide at least one environment variable to specify the circulation manager backend, as described in [Application Startup Configurations](#Application-Startup-Configurations). You can also provide the other optional environment variables when running your docker container. There are two ways to run the container: (1) via the command line, and (2) via `docker-compose` with a `docker-compose.yml` file.

When running the image with the `CONFIG_FILE` option, you will want to provide the file's directory to the container as a volume, so the container can access the file on your host machine. When doing this, replace `$PATH_TO_LOCAL_VOLUME` with the absolute path to the `/config` directory on the host machine.

#### From the command line

This command will download the image from NYPL's Docker Hub repo, and then run it with the `CONFIG_FILE` option (using a file named `cm_libraries.txt`) and the name `patronweb`. If you would like to run your locally built image, substitute `nypl/patron-web` with the tag of the image you built previously (just `patronweb` in the example above).

```
docker run -d --name patronweb -p 3000:3000\
  --restart=unless-stopped \
  -e "CONFIG_FILE=/config_volume/config.yml" \
  -v $PATH_TO_LOCAL_VOLUME:/config_volume \
  nypl/patronweb
```

What are these commands doing?

- `--name` - allows you to name your docker container
- `-d` - detatches the docker container from the terminal. If running locally, you can still view the container with Docker Desktop.
- `-p 3000:3000` - the default port exposed in the image during the build is 3000. This command maps that to port 3000 on the host machine so it can be accessed there.
- `--restart=unless-stopped` - this will make the container restart if it exits erroneously.
- `-e` - define environment variable(s).
- `-v $PATH_TO_LOCAL_VOLUME:/config` - allows you to specify which directory on the host machine will contain your config.

#### Using `docker-compose`

Instead of using the `docker run` command at the command line, it's also possible to use the `docker-compose` utility to create the container. Using docker-compose provides the advantage of encapsulating the run parameters in a configuration file that can be committed to source control. We've added an example `docker-compose.yml` file in this repository, which you can adjust as needed with parameters that fit your development.

To create the container using the `docker-compose.yml` file in this repository, simply run `docker-compose up`. This will build the image and start the container. To stop the container and remove it, run `docker-compose down`. Similarly you can run `docker-compose stop` to stop the container without removing it, and `docker-compose start` to restart a stopped container.

If you would like to use a `SIMPLIFIED_CATALOG_BASE` or `REGISTRY_BASE`, or provide any of the other documented [ENV vars](#Application-Startup-Configurations), simply replace the `CONFIG_FILE` setting in `docker-compose.yml`.

#### Helpful commands

- For debuggin purposes, you can run the container and skip the command to start the app, instead launching it directly into a shell. To do so, use this command:
  ```
  docker run -it --name patronweb -v $PATH_TO_LOCAL_VOLUME:/config --rm --entrypoint=/bin/sh patronweb
  ```

### Credits

<img alt="Bugsnag logo" src="https://global-uploads.webflow.com/5c741219fd0819540590e785/5e29d884752bb0072e2a0e6d_bugsnag-logo-full.png" width="200px"/>