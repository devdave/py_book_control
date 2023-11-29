import {Scene} from "@src/types.ts";
import {useLocation} from "react-router-dom";
import {Paper, Textarea, TextInput} from "@mantine/core";


export const SceneElement = ({scene}:{scene:Scene}) => {

    const {hash} = useLocation()

    return (
        <Paper id={scene.id} p="xl" style={{minHeight:"80vh"}}>
            <TextInput label={"Title"} value={scene.title}/>
            <Textarea autosize autoFocus={scene.id === hash.slice(1)} value={scene.content}></Textarea>
            <pre>{JSON.stringify(scene, null, 4)}</pre>
        </Paper>
    )


}
