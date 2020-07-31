/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Modal from "./Modal";
import { useDialogState, DialogDisclosure } from "reakit/Dialog";
import Button from "./Button";
import useAuth from "hooks/useAuth";
import Stack from "./Stack";

export default function SignOut() {
  const dialog = useDialogState();
  const { signOutAndGoHome } = useAuth();
  return (
    <>
      <DialogDisclosure as={Button} color="ui.black" {...dialog}>
        Sign Out
      </DialogDisclosure>
      <Modal
        isVisible={dialog.visible}
        dialog={dialog}
        role="alertdialog"
        hideOnClickOutside
        label="Sign Out"
      >
        <p>Are you sure you want to sign out?</p>
        <Stack sx={{ justifyContent: "center" }}>
          <Button variant="ghost" color="ui.gray.dark" onClick={dialog.hide}>
            Cancel
          </Button>
          <Button
            color="ui.error"
            onClick={signOutAndGoHome}
            aria-label="Confirm Sign Out"
          >
            Sign out
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
