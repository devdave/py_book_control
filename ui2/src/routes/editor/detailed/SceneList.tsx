import {useLocation, useParams} from "react-router-dom";
import {useAppContext} from "@src/App.context.ts";
import {type Scene, type UniqueId} from "@src/types.ts";
import {Accordion, LoadingOverlay, Text} from "@mantine/core";
import {SceneElement as DetailedSceneElement} from "@src/routes/editor/detailed/SceneElement.tsx";
import {useEffect, useState} from "react";


export const SceneList = () => {



    const params = useParams<{book_id:UniqueId, chapter_id:UniqueId, mode:string|undefined}>()
    const {hash} = useLocation()

    let chapter_id = params.chapter_id
    if(chapter_id?.includes(".")){
        const splitArray = chapter_id?.split(".")
        chapter_id = splitArray.at(0)
    }



    const { chapterBroker} = useAppContext()

    const {data:chapter, isLoading:chapterIsLoading} = chapterBroker.fetch(params.book_id as string, chapter_id as string)

    const [currentScene, setCurrentScene] = useState(hash?hash.slice(1):null)





    useEffect(() => {
        setCurrentScene(hash.slice(1))
    }, [hash]);



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

            <Accordion value={currentScene} onChange={setCurrentScene}>
                {chapter?.scenes.map((scene:Scene, idx)=>(
                    <Accordion.Item key={scene.id} value={scene.id}>
                        <Accordion.Control><Text>Scene #{idx+1} "{scene.title}"</Text></Accordion.Control>
                        <Accordion.Panel id={scene.id} >
                            <DetailedSceneElement scene={scene}/>
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>


        </>
    )


}
