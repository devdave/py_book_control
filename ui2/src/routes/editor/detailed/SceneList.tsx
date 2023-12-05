import {useParams} from "react-router-dom";
import {useAppContext} from "@src/App.context.ts";
import {Scene, UniqueId} from "@src/types.ts";
import {LoadingOverlay} from "@mantine/core";
import {SceneElement} from "@src/routes/editor/detailed/SceneElement.tsx";


export const SceneList = () => {



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
            <pre>{JSON.stringify(chapter, null, 4)}</pre>
            {chapter?.scenes.map((scene:Scene)=>(
                <div key={`${scene.id}_${scene.updated_on}`} id={scene.id}>
                    <br/>
                    <br/>
                    <br/>
                    <SceneElement scene={scene}/>
                </div>
            ))}


        </>
    )


}
