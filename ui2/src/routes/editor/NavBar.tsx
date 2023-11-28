import {NavLink as RoutedLink} from "react-router-dom";
import {NavLink} from "@mantine/core";
import {Book, Chapter, Scene} from "@src/types.ts";
import {AppShell} from "@mantine/core";

interface NavBarParams {
    book: Book;
}

export const NavBar:React.FC<NavBarParams> = ({book}) => {

    const ccount = book.chapters.length;

    return (
        <AppShell.Navbar>
            <h2>{ccount}</h2>
            { book.chapters.map((chapter:Chapter)=>
                <NavLink label={chapter.title} component={RoutedLink} to={`/book/${book.id}/chapter/${chapter.id}`}>

                    {chapter.scenes.map((scene:Scene)=>
                        <NavLink label={scene.title} component={RoutedLink} to={`/book/${book.id}/chapter/${chapter.id}#scene=${scene.id}`}>

                        </NavLink>
                    )}

                </NavLink>
            )}
        </AppShell.Navbar>
    )

}
