/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { DialogStateReturn, DialogBackdrop, Dialog } from "reakit";

type ModalProps = {
  isVisible: boolean;
  dialog: DialogStateReturn;
  hide?: () => void;
  label?: string;
  className?: string;
  hideOnClickOutside?: boolean;
  role?: string;
};

const Modal: React.FC<ModalProps> = ({
  dialog,
  isVisible,
  hide,
  children,
  label,
  className,
  hideOnClickOutside,
  role
}) => {
  return (
    <DialogBackdrop
      {...dialog}
      sx={{
        display: isVisible ? "flex" : "none",
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: ["modal"],
        justifyContent: "center",
        alignItems: "center"
      }}
      visible={isVisible}
    >
      <Dialog
        {...dialog}
        role={role}
        visible={isVisible}
        hide={hide ?? dialog.hide}
        className={className}
        hideOnClickOutside={hideOnClickOutside}
        sx={{
          background: "white",
          borderRadius: 2,
          boxShadow: "modal",
          px: 4,
          py: 3,
          m: 2
        }}
        aria-label={label}
      >
        {children}
      </Dialog>
    </DialogBackdrop>
  );
};

export default Modal;
