import React from "react";
import { Indicator, Textarea } from "@mantine/core";
import { TextareaProps } from "@mantine/core";

import classes from "./indicated_textarea.module.css";

interface IndicatedTextAreaProps {
  isDirty: ()=>boolean
  inputProps?: TextareaProps & React.RefAttributes<HTMLTextAreaElement>;
  indicatorStyle?: object;
  textStyle?: object;
  onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  label?: string
    rows?: number
}
 
export const IndicatedTextarea: React.FC<IndicatedTextAreaProps> = ({
    isDirty,
    inputProps,
    onKeyUp,
    label,
    rows,

}) => {
    return (
        <Indicator
            processing
            color="red"
            position="top-start"
            disabled={!isDirty()}

            style={{ height: "100%", boxSizing: "border-box" }}
        >
            <Textarea
                autosize
                minRows={rows||5}
                onKeyUp={onKeyUp}
                label={label || null}
                rows={rows}
                classNames={{
                    root: classes.max_out,
                    wrapper: classes.max_out,
                    input: classes.max_out,
                }}
                {...inputProps}
            />
        </Indicator>
    );
};
