/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Button from "./Button";
import useTypedSelector from "../hooks/useTypedSelector";
import { useForm } from "react-hook-form";
import FormInput from "./form/FormInput";
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

  const onSubmit = async ({ login, password }) => {
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
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <span sx={{ color: "warn" }}>
        {serverError && `Error: ${serverError}`}
      </span>
      <FormInput
        name="login"
        label={provider.method.labels.login}
        id="login"
        placeholder={provider.method.labels.login}
        ref={register({ required: true, maxLength: 25 })}
        error={
          errors?.login && `Your ${provider.method.labels.login} is required.`
        }
      />
      <FormInput
        name="password"
        label={provider.method.labels.password}
        ref={register({ required: true, maxLength: 25 })}
        id="password"
        type="password"
        placeholder={provider.method.labels.password}
        error={
          errors?.password &&
          `Your ${provider.method.labels.password} is required.`
        }
      />
      <Button type="submit" sx={{ alignSelf: "flex-end", m: 2 }}>
        Login
      </Button>
    </form>
  );
};

export default BasicAuthForm;
