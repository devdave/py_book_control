import {NavLink as RoutedLink, useParams} from "react-router-dom";
import {Box, Button, Center, Divider, Group, NavLink, SegmentedControl, ScrollArea} from "@mantine/core";
import {Book, Chapter, Scene} from "@src/types.ts";
import {AppShell} from "@mantine/core";
import {
    IconArticle,
    IconBook,
    IconFlagFilled,
    IconGripVertical,
    IconList,
    IconPlus,
    IconUsers
} from "@tabler/icons-react";

import {useAppContext} from "@src/App.context.ts";
import {useCallback} from "react";
import {NewChapterModal} from "@src/routes/editor/widget/NewChapterModal.tsx";
import {NewSceneModal} from "@src/routes/editor/widget/NewSceneModal.tsx"


interface NavBarParams {
    book: Book;
}

export const NavBar:React.FC<NavBarParams> = ({book}) => {

    const {viewMode, setViewMode, chapterBroker, sceneBroker} = useAppContext()

    const params = useParams<{chapter_id?:string}>()

    const handleNewChapter = useCallback( async ()=>{
        const [chapterName, ] = await NewChapterModal()
        if(chapterName && chapterName.length >= 3 ){
            chapterBroker.create(book.id, chapterName).then((newChapter)=>{
                if(newChapter){
                    sceneBroker.create(book.id, newChapter.id, "New scene").then((val)=>{
                        console.log("New chapter and scene created!", newChapter, val)
                    })
                }
            })
        }
    },[book])

    const handleNewScene = useCallback(async (chapterId:Chapter['id'])=>{
        const newScenename = await NewSceneModal()
        if(newScenename && newScenename.length >= 3) {
            await sceneBroker.create(book.id, chapterId, newScenename)
        } else {
            console.log(newScenename, newScenename.length, params.chapter_id)
        }
    },[book, params])


    
    return (
        <AppShell.Navbar>
            <AppShell.Section>
                <Group>
                    <SegmentedControl

                        value={viewMode}
                        onChange={setViewMode}
                        data={[
                            {
                                value: "detailed",
                                label: (
                                    <Center>
                                        <IconList />
                                        <Box ml={10}>Detailed</Box>
                                    </Center>
                                )
                            },
                            {
                                value: "flow",
                                label: (
                                    <Center>
                                        <IconArticle />
                                        <Box ml={10}>Flow</Box>
                                    </Center>
                                )
                            }
                        ]}
                    />
                </Group>
                <Button onClick={handleNewChapter}><IconPlus />Create new chapter</Button>
                <NavLink
                    state={{title:"Book overview"}}
                    leftSection={<IconBook/>}
                    label={`Book: ${book.title}`}
                    component={RoutedLink}
                    to={`/book/${book.id}/overview`}/>
                <NavLink
                    state={{title:"Characters"}}
                    childrenOffset={1}
                    label='Characters'
                    component={RoutedLink}
                    to={`/book/${book.id}/characters`}


                    opened
                    leftSection={
                        <Center>
                            <IconUsers />
                        </Center>
                    }
                />
                <NavLink
                    childrenOffset={1}
                    state={{title:"Book statuses"}}
                    label='Statuses'
                    component={RoutedLink}
                    to={`/book/${book.id}/statuses`}
                    leftSection={
                        <Center>
                            <IconFlagFilled />
                        </Center>
                    }
                />
            </AppShell.Section>
            <AppShell.Section grow component={ScrollArea}>
                <Divider
                    label={"Chapters"}
                />

                { book.chapters.map((chapter:Chapter, idx)=>
                    <NavLink
                        state={{title:`Chapter #${idx+1}`}}
                        key={chapter.id}
                        leftSection={<IconGripVertical size='1rem' />}
                        label={`${idx+1}. Chapter: ${chapter.title}`}
                        component={RoutedLink}
                        to={`/book/${book.id}/chapter/${chapter.id}`}>
                        {chapter.scenes.length == 0 &&
                            <Button onClick={()=>handleNewScene(chapter.id)}><IconPlus />Add new scene</Button>
                        }
                        {chapter.scenes.length > 0 && chapter.scenes.map((scene:Scene)=>
                            <NavLink
                                key={scene.id}
                                label={scene.title}
                                component={RoutedLink}
                                state={{title:`Chapter #${idx+1} - Scene: ${scene.title}`}}
                                to={`/book/${book.id}/${viewMode}/chapter/${chapter.id}#${scene.id}`}
                                rightSection={<IconFlagFilled style={{color:scene?.status?.color}}/>}
                            />
                        )}
                    </NavLink>
                )}
            </AppShell.Section>
        </AppShell.Navbar>
    )

}
