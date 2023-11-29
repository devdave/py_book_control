import {NavLink as RoutedLink} from "react-router-dom";
import {NavLink, Title} from "@mantine/core";
import {Book, Chapter, Scene} from "@src/types.ts";
import {AppShell} from "@mantine/core";


interface NavBarParams {
    book: Book;
}

export const NavBar:React.FC<NavBarParams> = ({book}) => {



    return (
        <AppShell.Navbar>
            <NavLink label={<Title>{book.title}</Title>} component={RoutedLink} to={`/book/${book.id}`}/>
            { book.chapters.map((chapter:Chapter)=>
                <NavLink label={`Chapter: ${chapter.title}`} component={RoutedLink} to={`/book/${book.id}/chapter/${chapter.id}`}>

                    {chapter.scenes.map((scene:Scene)=>
                        <NavLink label={scene.title} component={RoutedLink} to={`/book/${book.id}/chapter/${chapter.id}#${scene.id}`}>

                        </NavLink>
                    )}

                </NavLink>
            )}
        </AppShell.Navbar>
    )

}
