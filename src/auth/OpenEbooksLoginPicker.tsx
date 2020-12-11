/** @jsx jsx */
import { jsx } from "theme-ui";
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
        <Stack
          direction="column"
          sx={{
            mx: [3, 5],
            my: 4,
            justifyContent: "space-between",
            flexWrap: ["wrap", "nowrap"]
          }}
        >
          <img
            sx={{ alignSelf: "center" }}
            alt="Clever Logo"
            src={"/img/CleverLogo.png"}
          />
          <Text>
            Clever is the platform that powers technology in the classroom.
            Today, one in three innovative K-12 schools in the U.S. trust Clever
            to secure their student data as they adopt learning apps in the
            classroom.
          </Text>
          <div>
            <AuthButton
              sx={{ mx: ["auto", "auto", 0] }}
              method={cleverMethod}
            />
          </div>
        </Stack>
        <Stack
          direction="column"
          sx={{
            mx: [3, 5],
            my: 4,
            justifyContent: "space-between",
            flexWrap: ["wrap", "nowrap"]
          }}
        >
          <img
            sx={{ alignSelf: "center" }}
            alt="FirstBook Logo"
            src={"/img/FirstBookLogo.png"}
          />
          <Text>
            First Book is a nonprofit organization that provides access to high
            quality, brand new books and educational resources - for free and at
            low cost - to schools and programs serving children in need.
          </Text>
          <div>
            <AuthButton sx={{ mx: ["auto", "auto", 0] }} method={basicMethod} />
          </div>
        </Stack>
      </div>
    </div>
  );
}
