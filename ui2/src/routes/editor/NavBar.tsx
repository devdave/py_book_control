import {NavLink as RoutedLink, useParams} from "react-router-dom";
import {Box, Button, Center, Divider, Group, NavLink, SegmentedControl} from "@mantine/core";
import {Book, Chapter, Scene} from "@src/types.ts";
import {AppShell} from "@mantine/core";
import {IconArticle, IconBook, IconFlagFilled, IconList, IconPlus, IconUsers} from "@tabler/icons-react";

import {useAppContext} from "@src/App.context.ts";
import {useCallback} from "react";
import {NewChapterModal} from "@src/routes/editor/widget/NewChapterModal.tsx";


interface NavBarParams {
    book: Book;
}

export const NavBar:React.FC<NavBarParams> = ({book}) => {

    const {viewMode, setViewMode, chapterBroker} = useAppContext()

    const params = useParams<{chapter_id?:string}>()

    const handleNewChapter = useCallback( async (_evt)=>{
        const [chapterName, _chapterMode] = await NewChapterModal()
        if(chapterName && chapterName.length >= 3 ){
            chapterBroker.create(book.id, chapterName).then()
        }

    },[book])

    console.log("Params", params)

    return (
        <AppShell.Navbar>
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
            <NavLink leftSection={<IconBook/>} label={`Book: ${book.title}`} component={RoutedLink} to={`/book/${book.id}`}/>
            <NavLink
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
                label='Statuses'
                component={RoutedLink}
                to={`/book/${book.id}/statuses`}
                leftSection={
                    <Center>
                        <IconFlagFilled />
                    </Center>
                }
            />
            <Divider
                label={"Chapters"}
            />

            { book.chapters.map((chapter:Chapter, idx)=>
                <NavLink label={`${idx+1}. Chapter: ${chapter.title}`} component={RoutedLink} to={`/book/${book.id}/chapter/${chapter.id}`}>

                    {chapter.scenes.map((scene:Scene)=>
                        <NavLink label={scene.title} component={RoutedLink} to={`/book/${book.id}/chapter/${chapter.id}#${scene.id}`}
                            rightSection={<IconFlagFilled style={{color:scene.status.color}}/>}
                        >

                        </NavLink>
                    )}

                </NavLink>
            )}
        </AppShell.Navbar>
    )

}
