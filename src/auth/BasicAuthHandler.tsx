/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Text } from "components/Text";
import Button, { NavButton } from "components/Button";
import FormInput from "components/form/FormInput";
import { modalButtonStyles } from "components/Modal";
import { ClientBasicMethod } from "interfaces";
import { generateToken } from "auth/useCredentials";
import useUser from "components/context/UserContext";
import { ServerError } from "errors";
import useLogin from "auth/useLogin";
import useLibraryContext from "components/context/LibraryContext";

type FormData = {
  [key: string]: string;
};

/**
 * Renders a form for completing basic auth.
 */
const BasicAuthHandler: React.FC<{ method: ClientBasicMethod }> = ({
  method
}) => {
  const { signIn, error, isLoading } = useUser();
  const { baseLoginUrl } = useLogin();
  const { register, handleSubmit, errors } = useForm<FormData>();
  const { authMethods } = useLibraryContext();

  const usernameInputName = method.labels.login;
  const passwordInputName = method.labels.password;

  const onSubmit = handleSubmit(async values => {
    const login = values[usernameInputName];
    const password = values[passwordInputName];
    // try to login with these credentials
    const token = generateToken(login, password);
    signIn(token, method);
  });

  const serverError = error instanceof ServerError ? error : undefined;

  const hasMultipleMethods = authMethods.length > 1;

  return (
    <form
      onSubmit={onSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 400
      }}
    >
      <Text sx={{ color: "ui.error", alignItems: "center", display: "flex" }}>
        {serverError && `${serverError.info.title}: ${serverError.info.detail}`}
      </Text>
      <FormInput
        name={usernameInputName}
        label={usernameInputName}
        id="login"
        placeholder={usernameInputName}
        ref={register({ required: true, maxLength: 25 })}
        error={
          errors[usernameInputName] && `Your ${usernameInputName} is required.`
        }
      />
      <FormInput
        name={passwordInputName}
        label={passwordInputName}
        ref={register({ required: true, maxLength: 25 })}
        id="password"
        type="password"
        placeholder={passwordInputName}
        error={
          errors[passwordInputName] && `Your ${passwordInputName} is required.`
        }
      />

      <Button
        type="submit"
        sx={{
          ...modalButtonStyles
        }}
        loading={isLoading}
        loadingText="Signing in..."
      >
        Login
      </Button>
      {hasMultipleMethods && (
        <NavButton href={baseLoginUrl} variant="link">
          Use a different login method
        </NavButton>
      )}
    </form>
  );
};

export default BasicAuthHandler;
