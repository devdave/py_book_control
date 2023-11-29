import {useLocation, useParams} from "react-router-dom";
import {useAppContext} from "@src/App.context.ts";
import {Scene, UniqueId} from "@src/types.ts";
import {LoadingOverlay} from "@mantine/core";
import {SceneElement} from "@src/routes/editor/detailed/SceneElement.tsx";


export const SceneList = () => {

    const {hash:sceneId} = useLocation()

    const params = useParams<{book_id:UniqueId, chapter_id:UniqueId}>()

    const { chapterBroker} = useAppContext()

    const {data:chapter, isLoading:chapterIsLoading} = chapterBroker.fetch(params.book_id as string, params.chapter_id as string)



    if(chapterIsLoading) {
        return (
            <LoadingOverlay visible/>
        )
    }

    return (
        <>
            <div>SID: {sceneId.slice(1)}</div>
            {chapter?.scenes.map((scene:Scene)=>(
                <div id={scene.id}>
                    <br/>
                    <br/>
                    <br/>
                    <SceneElement scene={scene}/>
                </div>
            ))}


        </>
    )


}
