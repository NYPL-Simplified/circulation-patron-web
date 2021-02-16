/** @jsx jsx */
import { jsx, SxProps } from "theme-ui";
import * as React from "react";
import Stack from "components/Stack";
import AuthButton from "auth/AuthButton";
import { ClientBasicMethod, ClientCleverMethod, OPDS1 } from "interfaces";
import useLibraryContext from "components/context/LibraryContext";
import { AppSetupError } from "errors";

export default function LoginRegion(): JSX.Element {
  const { authMethods } = useLibraryContext();

  const cleverMethod = authMethods.find(
    method => method.type === OPDS1.CleverAuthType
  ) as ClientCleverMethod | undefined;

  const basicMethod = authMethods.find(
    method => method.type === OPDS1.BasicAuthType
  ) as ClientBasicMethod | undefined;

  if (!cleverMethod || !basicMethod)
    throw new AppSetupError(
      "Application is missing either Clever or Basic Auth methods"
    );

  return (
    <div
      id="loginRegion"
      sx={{
        backgroundColor: "ui.gray.extraLight"
      }}
    >
      <div
        sx={{
          maxWidth: 1100,
          mx: "auto",
          display: "flex",
          textAlign: ["center", "center", "left"],
          flexWrap: ["wrap", "wrap", "nowrap"]
        }}
      >
        <Stack direction="column" sx={column}>
          <div sx={logoHeader}>
            <img alt="Clever Logo" src={"/img/CleverLogo.png"} />
          </div>
          <div>
            <AuthButton sx={loginButton} method={cleverMethod} />
          </div>
        </Stack>
        <Stack direction="column" sx={column}>
          <div sx={logoHeader}>
            <img alt="FirstBook Logo" src={"/img/FirstBookLogo.png"} />
          </div>
          <AuthButton sx={loginButton} method={basicMethod} />
        </Stack>
      </div>
    </div>
  );
}

const column: SxProps["sx"] = {
  mx: [3, 5],
  my: 4,
  justifyContent: "space-between",
  flexWrap: ["wrap", "nowrap"],
  alignItems: "center",
  width: ["100%", "100%", "50%"]
};

const loginButton: SxProps["sx"] = {
  flex: "0 0 auto",
  mx: ["auto", "auto", 0]
};

const logoHeader: SxProps["sx"] = {
  height: 86,
  display: "flex",
  alignItems: "center",
  marginBottom: ["10px", "10px", "25px"]
};
