/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Button from "components/Button";
import useTypedSelector from "hooks/useTypedSelector";
import { useForm } from "react-hook-form";
import FormInput from "components/form/FormInput";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import { generateCredentials } from "opds-web-client/lib/utils/auth";
import { BasicAuthMethod } from "opds-web-client/lib/interfaces";
import { AuthFormProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";

type FormData = {
  login: string;
  password: string;
};

/**
 * Auth form
 */
const BasicAuthForm: React.FC<AuthFormProps<BasicAuthMethod>> = ({
  provider
}) => {
  const authState = useTypedSelector(state => state.auth);
  const { callback, error: serverError } = authState;
  const { actions, dispatch } = useActions();
  const { register, handleSubmit, errors } = useForm<FormData>();

  const usernameInputName = provider.method.labels.login;
  const passwordInputName = provider.method.labels.password;

  let imageUrl;

  for (const link of provider.method.links || []) {
    if (link.rel === "logo") {
      imageUrl = link.href;
      break;
    }
  }

  const onSubmit = handleSubmit(async values => {
    const login = values[usernameInputName];
    const password = values[passwordInputName];
    // create credentials
    const credentials = generateCredentials(login, password);
    // save them with redux
    dispatch(
      actions.saveAuthCredentials({
        provider: provider.id,
        credentials
      })
    );
    // call the callback that was saved when the form was triggered
    callback?.();
  });
  return (
    <form onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column" }}>
      <span sx={{ color: "ui.error" }}>
        {serverError && `Error: ${serverError}`}
      </span>
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
          alignSelf: "flex-end",
          m: 2,
          mr: 0,
          flex: "1 0 auto",
          width: "280px",
          height: "51px",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0",
          backgroundImage: `url(${imageUrl})`,
          cursor: "pointer",
          border: "none"
        }}
      >
        {!imageUrl ? "Login" : ""}
      </Button>
    </form>
  );
};

export default BasicAuthForm;
