
import {React} from "react";
import {Chapter} from "./types.ts";
import {Textarea} from "@mantine/core";

interface ChapterDetailProps {
    activeElement:Chapter,
}

// @ts-ignore
export const ChapterDetail:React.FC<ChapterDetailProps> = ({activeElement}) => {

    return (
        <>
            <h2>{activeElement.name}</h2>
            <Textarea label="Notes" value={activeElement.notes}/>


        </>
    )
}
