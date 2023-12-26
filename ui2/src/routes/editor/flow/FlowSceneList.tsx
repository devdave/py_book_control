import {useParams} from "react-router-dom";
import {useAppContext} from "@src/App.context.ts";
import {type Scene, type UniqueId} from "@src/types.ts";
import {Divider, LoadingOverlay,} from "@mantine/core";
import {SceneElement as FlowSceneElement} from "./SceneElement.tsx";



export const FlowSceneList = () => {



    const params = useParams<{book_id:UniqueId, chapter_id:UniqueId, mode:string|undefined}>()


    let chapter_id = params.chapter_id
    if(chapter_id?.includes(".")){
        const splitArray = chapter_id?.split(".")
        chapter_id = splitArray.at(0)
    }



    const { chapterBroker} = useAppContext()

    const {data:chapter, isLoading:chapterIsLoading} = chapterBroker.fetch(params.book_id as string, chapter_id as string)





    if(chapterIsLoading) {
        return (
            <LoadingOverlay visible/>
        )
    }

    return (
        <>
            {params.mode}
            <details>
                <summary>JSON</summary>
                <pre>{JSON.stringify(chapter, null, 4)}</pre>
            </details>

            <>
                {chapter?.scenes.map((scene:Scene, idx)=>(
                    <div id={scene.id} key={idx}>
                        <FlowSceneElement scene={scene}/>
                        <Divider size={"md"} variant={"dashed"}/>
                    </div>
                ))}
            </>


        </>
    )


}
