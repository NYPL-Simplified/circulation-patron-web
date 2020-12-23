/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Modal from "./Modal";
import { useDialogState, DialogDisclosure } from "reakit/Dialog";
import Button from "./Button";
import Stack from "./Stack";
import useUser from "components/context/UserContext";

export default function SignOut() {
  const dialog = useDialogState();
  const { signOut, isLoading } = useUser();
  function signOutAndClose() {
    signOut();
    dialog.hide();
  }
  return (
    <>
      <DialogDisclosure
        as={Button}
        color="ui.black"
        loading={isLoading}
        {...dialog}
      >
        Sign Out
      </DialogDisclosure>
      <Modal
        isVisible={dialog.visible}
        dialog={dialog}
        role="alertdialog"
        hideOnClickOutside
        label="Sign Out"
        showClose={false}
      >
        <p>Are you sure you want to sign out?</p>
        <Stack sx={{ justifyContent: "center" }}>
          <Button variant="ghost" color="ui.gray.dark" onClick={dialog.hide}>
            Cancel
          </Button>
          <Button
            color="ui.error"
            onClick={signOutAndClose}
            aria-label="Confirm Sign Out"
          >
            Sign out
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
