/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Modal from "../Modal";
import useComplaints from "../../hooks/useComplaints";
import { DialogDisclosure } from "reakit";
import { TextArea } from "../TextInput";
import { useForm } from "react-hook-form";
import Button from "../Button";
import { BookData, ComplaintData } from "../../interfaces";
import LoadingIndicator from "../LoadingIndicator";
import Select, { Label } from "../Select";
import { H1 } from "components/Text";
import { getReportUrl } from "utils/libraryLinks";

const getDisplayType = (type: string) =>
  type
    .replace("http://librarysimplified.org/terms/problem/", "")
    .replace(/-/g, " ")
    .split(" ")
    .map(t => (t ? t[0].toUpperCase() + t.slice(1) : ""))
    .join(" ");

type ComplaintFormData = Required<ComplaintData>;

const ReportProblem: React.FC<{ book: BookData }> = ({ book }) => {
  const { state, dialog, dispatch, postComplaint } = useComplaints(book);

  const hasReportUrl = Boolean(getReportUrl(book.raw));
  const handleClick = () => dispatch({ type: "REPORT_PROBLEM" });

  const { register, handleSubmit, errors, reset } = useForm<
    ComplaintFormData
  >();
  const cancel = () => {
    reset();
    dispatch({ type: "REPORT_PROBLEM_CANCEL" });
  };

  const onSubmit = handleSubmit(({ type, detail }) => {
    postComplaint({ type, detail });
  });

  if (!hasReportUrl) {
    return null;
  }

  return (
    <React.Fragment>
      <Modal
        isVisible={state.showForm}
        dialog={dialog}
        label="Report a problem"
        hide={cancel}
        sx={{ width: "100%", maxWidth: 600 }}
      >
        {state.success ? (
          <div sx={{ display: "flex", flexDirection: "column" }}>
            <H1 sx={{ fontSize: 3, textAlign: "center" }}>
              Your problem was reported. Thank you!
            </H1>
            <Button sx={{ alignSelf: "flex-end" }} onClick={cancel}>
              Done
            </Button>
          </div>
        ) : state.isPosting ? (
          <div sx={{ display: "flex", justifyContent: "center" }}>
            <LoadingIndicator />
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              "&>label": {
                mt: 2,
                mb: 1
              }
            }}
          >
            <H1 sx={{ alignSelf: "center", fontSize: [3, 4] }}>
              Report a problem
            </H1>
            <Label htmlFor="complaint-type">Complaint Type</Label>
            <Select
              id="complaint-type"
              name="type"
              ref={register({ required: "Please choose a type" })}
              aria-describedby="complaint-type-error"
            >
              {state.types.map(type => (
                <option key={type} value={type}>
                  {getDisplayType(type)}
                </option>
              ))}
            </Select>
            {errors.type && (
              <span
                id="complaint-type-error"
                sx={{ color: "ui.error", fontStyle: "italic" }}
              >
                Error: {errors.type.message}
              </span>
            )}
            <label htmlFor="complaint-body">Details</label>
            <TextArea
              id="complaint-body"
              name="detail"
              ref={register({
                required: "Please enter details about the problem."
              })}
              sx={{ alignSelf: "stretch", maxWidth: "100%" }}
              aria-describedby="complaint-body-error"
            />
            {errors.detail && (
              <span
                id="complaint-body-error"
                sx={{ color: "ui.error", fontStyle: "italic" }}
              >
                Error: {errors.detail.message}
              </span>
            )}
            <div sx={{ mt: 3, "&>button": { ml: 2 }, alignSelf: "flex-end" }}>
              <Button variant="ghost" onClick={cancel}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        )}
      </Modal>

      <DialogDisclosure
        {...dialog}
        onClick={handleClick}
        as={Button}
        data-testid="report-problem-link"
        variant="link"
        color="ui.gray.extraDark"
        sx={{ fontStyle: "italic" }}
      >
        Report a problem
      </DialogDisclosure>
    </React.Fragment>
  );
};

export default ReportProblem;
