import {EditModes} from "@src/types";
import {RightPanel} from "@src/modes/edit/editor_panel/RightPanel";
import {ContinuousBody} from "@src/modes/edit/continuous_panel";
import {useEditorContext} from "@src/modes/edit/Editor.context";
import {Text} from "@mantine/core";


export const Body = () => {

    const {editMode, activeChapter, activeScene} = useEditorContext()

    switch (editMode) {
        case EditModes.LIST:
            if (activeChapter !== undefined) {
                return (
                    <RightPanel key={`${activeChapter.updated_on} ${activeChapter.id}-${activeScene?.id}`}/>
                )
            } else {
                return (
                    <h2>Create a new chapter!</h2>
                )
            }
            break;
        case EditModes.FLOW:
            if (activeChapter !== undefined) {
                return (
                    <ContinuousBody key={`${activeChapter.id} ${activeChapter.updated_on}`}/>
                )
            } else {
                return (
                    <h2>Create a new chapter!</h2>
                )
            }
        default:
            return (
                <Text>Error: unknown edit mode {editMode}</Text>
            )


    }

}