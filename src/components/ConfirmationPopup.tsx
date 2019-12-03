import * as React from "react";

export interface ConfirmationPopupProps {
  confirm: () => void;
  cancel: () => void;
  text: string;
  confirmText: string;
  cancelText: string;
}

export default class ConfirmationPopup extends React.Component<
  ConfirmationPopupProps,
  any
> {
  render() {
    return (
      <div className="confirmation-popup">
        <h3>{this.props.text}</h3>
        <button
          className="btn btn-default confirm-button"
          onClick={this.props.confirm}
        >
          {this.props.confirmText}
        </button>
        <button
          className="btn btn-default cancel-button"
          onClick={this.props.cancel}
        >
          {this.props.cancelText}
        </button>
      </div>
    );
  }
}
