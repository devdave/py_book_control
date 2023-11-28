import { UseFormReturnType } from "@mantine/form";
import React from "react";
import { Indicator, Textarea } from "@mantine/core";
import { TextareaProps } from "@mantine/core";

import classes from "./indicated_textarea.module.css";

interface IndicatedTextAreaProps {
  form: UseFormReturnType<unknown>;
  formField: string;
  inputProps?: TextareaProps & React.RefAttributes<HTMLTextAreaElement>;
  indicatorStyle?: object;
  textStyle?: object;
  onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement>;
}

export const IndicatedTextarea: React.FC<IndicatedTextAreaProps> = ({
  form,
  formField,
  inputProps,
  onKeyUp,
}) => {
  return (
    <Indicator
      processing
      color="red"
      position="top-start"
      disabled={!form.isDirty(formField)}
      style={{ height: "100%", boxSizing: "border-box" }}
    >
      <Textarea
        autosize
        minRows={5}
        onKeyUp={onKeyUp}
        classNames={{
          root: classes.max_out,
          wrapper: classes.max_out,
          input: classes.max_out,
        }}
        {...form.getInputProps(formField)}
        {...inputProps}
      />
    </Indicator>
  );
};
