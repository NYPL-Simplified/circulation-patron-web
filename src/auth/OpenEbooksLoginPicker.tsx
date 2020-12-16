/** @jsx jsx */
import { jsx, SxProps } from "theme-ui";
import * as React from "react";
import Stack from "components/Stack";
import { Text } from "components/Text";
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
          <Text sx={description}>
            Clever is the platform that powers technology in the classroom.
            Today, one in three innovative K-12 schools in the U.S. trust Clever
            to secure their student data as they adopt learning apps in the
            classroom.
          </Text>
          <div>
            <AuthButton sx={loginButton} method={cleverMethod} />
          </div>
        </Stack>
        <Stack direction="column" sx={column}>
          <div sx={logoHeader}>
            <img alt="FirstBook Logo" src={"/img/FirstBookLogo.png"} />
          </div>
          <Text sx={description}>
            First Book is a nonprofit organization that provides access to high
            quality, brand new books and educational resources - for free and at
            low cost - to schools and programs serving children in need.
          </Text>
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
  alignItems: ["center", "center", "flex-start"]
};

const description: SxProps["sx"] = {
  flex: 1,
  pb: 2
};

const loginButton: SxProps["sx"] = {
  flex: "0 0 auto",
  mx: ["auto", "auto", 0]
};

const logoHeader: SxProps["sx"] = {
  height: 86,
  display: "flex",
  alignItems: "center"
};
