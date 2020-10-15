/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { DialogStateReturn, DialogBackdrop, Dialog } from "reakit";
import { Icon, IconNames } from "@nypl/design-system-react-components";
import Button from "components/Button";

export const modalButtonStyles = {
  m: 2,
  display: "flex",
  flex: "1 0 auto",
  width: "280px",
  height: "51px",
  backgroundSize: `280px 51px`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0",
  cursor: "pointer",
  border: "none",
  marginLeft: "auto",
  marginRight: "auto"
};

type ModalProps = {
  isVisible: boolean;
  dialog: DialogStateReturn;
  hide?: () => void;
  label?: string;
  className?: string;
  hideOnClickOutside?: boolean;
  role?: string;
  showClose?: boolean;
};

const Modal: React.FC<ModalProps> = ({
  dialog,
  isVisible,
  hide,
  children,
  label,
  className,
  hideOnClickOutside,
  role,
  showClose = true
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
          m: 2,
          position: "relative"
        }}
        aria-label={label}
      >
        {showClose && (
          <Button
            variant="ghost"
            color="ui.gray.dark"
            onClick={hide}
            sx={{ position: "absolute", top: 2, right: 2 }}
          >
            <Icon
              decorative={false}
              name={IconNames.close}
              sx={{ fontSize: 18 }}
            />
          </Button>
        )}
        {children}
      </Dialog>
    </DialogBackdrop>
  );
};

// const DialogClose: React.FC = () => {

// }

export default Modal;
