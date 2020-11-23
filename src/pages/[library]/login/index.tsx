import * as React from "react";
import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import LayoutPage from "components/LayoutPage";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import LoginWrapper from "auth/LoginWrapper";
import useLibraryContext from "components/context/LibraryContext";
import useLinkUtils from "hooks/useLinkUtils";
import { useRouter } from "next/router";
import AuthButton from "auth/AuthButton";
import ExternalLink from "components/ExternalLink";
import FormLabel from "components/form/FormLabel";
import Stack from "components/Stack";
import { AppAuthMethod } from "interfaces";
import { Select } from "theme-ui";
import { Text } from "components/Text";

const LoginPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <LayoutPage library={library} error={error}>
      <LoginWrapper>
        <LoginSelector />
      </LoginWrapper>
    </LayoutPage>
  );
};

const LoginSelector = () => {
  const { authMethods } = useLibraryContext();
  const { buildMultiLibraryLink } = useLinkUtils();
  const { push } = useRouter();

  /**
   * The options:
   *  - No auth methods available. Tell the user.
   *  - There is only one method. (automatically redirect there)
   *  - There are 1-5 methods. Show the buttons-based flow.
   *  - There are >5 methods. Show the combobox flow.
   */
  const formStatus =
    authMethods.length === 0
      ? "no-auth"
      : authMethods.length < 5
      ? "buttons"
      : "combobox";

  // redirect user automatically to apropriate method if there is
  // only one auth method
  React.useEffect(() => {
    if (authMethods.length === 1) {
      const singleAuthUrl = buildMultiLibraryLink(
        `/login/${encodeURIComponent(authMethods[0].id)}`
      );
      push(singleAuthUrl);
    }
  }, [push, authMethods, buildMultiLibraryLink]);

  switch (formStatus) {
    case "no-auth":
      return <NoAuth />;
    case "combobox":
      return <Combobox authMethods={authMethods} />;
    case "buttons":
      return <Buttons authMethods={authMethods} />;
  }
};

const NoAuth: React.FC = () => {
  const {
    libraryLinks: { helpEmail }
  } = useLibraryContext();
  return (
    <div sx={{ display: "flex", justifyContent: "center", maxWidth: 500 }}>
      <Text>
        This Library does not have any authentication configured.{" "}
        {helpEmail && (
          <Text>
            If this is an error, please contact your site administrator via
            email at:{" "}
            <ExternalLink
              role="link"
              href={helpEmail.href}
              aria-label="Send email to help desk"
            >
              {helpEmail.href.replace("mailto:", "")}
            </ExternalLink>
            .
          </Text>
        )}
      </Text>
    </div>
  );
};

/**
 * Renders buttons that allow selecting between auth providers.
 */
const Buttons: React.FC<{
  authMethods: AppAuthMethod[];
}> = ({ authMethods }) => {
  return (
    <Stack direction="column" aria-label="Available authentication methods">
      {authMethods.map(method => (
        <AuthButton key={method.id} method={method} />
      ))}
    </Stack>
  );
};

/**
 * Renders a combobox style auth method selector.
 */
const Combobox: React.FC<{
  authMethods: AppAuthMethod[];
}> = ({ authMethods }) => {
  const [selectedMethod, setSelectedMethod] = React.useState<AppAuthMethod>(
    authMethods[0]
  );

  const handleChangeMethod = (id: string) => {
    const method = authMethods.find(m => m.id === id);
    if (method) setSelectedMethod(method);
  };

  return (
    <div sx={{ mb: 2 }}>
      <FormLabel htmlFor="login-method-select">Login Method</FormLabel>
      <Select
        aria-label="Choose login method"
        id="login-method-select"
        onChange={e => handleChangeMethod(e.target.value)}
      >
        {authMethods?.map(method => (
          <option key={method.id} value={method.id}>
            {method.description}
          </option>
        ))}
      </Select>
      <AuthButton method={selectedMethod} />
    </div>
  );
};

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default LoginPage;
