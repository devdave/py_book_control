import {NavLink as RoutedLink, useParams} from "react-router-dom";
import {Box, Button, Center, Group, NavLink, SegmentedControl, Title} from "@mantine/core";
import {Book, Chapter, Scene} from "@src/types.ts";
import {AppShell} from "@mantine/core";
import {IconArticle, IconBook, IconList, IconPlus} from "@tabler/icons-react";
import {useState} from "react";


interface NavBarParams {
    book: Book;
}

export const NavBar:React.FC<NavBarParams> = ({book}) => {

    const [editMode, setEditMode] = useState("Detailed")

    const {chapter_id} = useParams<{chapter_id?:string}>()





    return (
        <AppShell.Navbar>
            <Group>
                <SegmentedControl
                    disabled={!chapter_id}
                    value={editMode}
                    onChange={setEditMode}
                    data={[
                        {
                            value: "Detailed",
                            label: (
                                <Center>
                                    <IconList />
                                    <Box ml={10}>Detailed</Box>
                                </Center>
                            )
                        },
                        {
                            value: "Flow",
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
            <Button><IconPlus />Create new chapter</Button>
            <NavLink label={<><IconBook/><Title>Book: {book.title}</Title></>} component={RoutedLink} to={`/book/${book.id}`}/>

            { book.chapters.map((chapter:Chapter, idx)=>
                <NavLink label={`${idx+1}. Chapter: ${chapter.title}`} component={RoutedLink} to={`/book/${book.id}/chapter/${chapter.id}`}>

                    {chapter.scenes.map((scene:Scene)=>
                        <NavLink label={scene.title} component={RoutedLink} to={`/book/${book.id}/chapter/${chapter.id}#${scene.id}`}>

                        </NavLink>
                    )}

                </NavLink>
            )}
        </AppShell.Navbar>
    )

}
