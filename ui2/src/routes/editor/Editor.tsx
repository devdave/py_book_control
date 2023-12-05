import {Outlet, Route, Routes, useParams} from "react-router-dom";

import { useAppContext } from "@src/App.context.ts";
import {

    AppShell,

    LoadingOverlay,

} from "@mantine/core";
import { useMemo} from "react";
import {EditorContext} from "@src/routes/editor/Editor.context.ts";

import {NavBar} from "@src/routes/editor/NavBar.tsx";
import {SceneList} from "@src/routes/editor/detailed/SceneList.tsx";
import {BookOverview} from "@src/routes/editor/BookOverview.tsx";
import {Header} from "@src/routes/editor/Header.tsx";
import {Characters} from "@src/routes/editor/Characters.tsx";
import {Statuses} from "@src/routes/editor/Statuses.tsx";



export const Editor = () => {
    const { bookBroker } = useAppContext();

    const { book_id } = useParams();

    const { isLoading, isError, data: book } = bookBroker.fetch(book_id as string);

    const editorContextValue = useMemo(()=>({
        book
    }),[book])





    console.log("Editor got ", book);

    if(isLoading){
        return (
            <LoadingOverlay visible>
                <h1>Book is loading</h1>
            </LoadingOverlay>
        )
    }

    if(isError||!book) {
        return (
            <>
                <h1>There was an error</h1>
                <p>I am currently unable to load the requested book</p>
            </>
        )
    }



    return (
        <EditorContext.Provider value={editorContextValue}>
            <AppShell header={{height:90}}
                navbar={{width:260, breakpoint:"sm"}}>
                <Header key={book.updated_on} book={book} />
                {<NavBar book={book}/>}
                <AppShell.Main>
                    <Routes>
                        <Route path="characters" element={<Characters book={book}/>}/>
                        <Route path="statuses" element={<Statuses book={book}/>}/>
                        <Route path="chapter/:chapter_id" element={<SceneList/>} />
                        <Route path="*" element={<BookOverview key={book.updated_on} book={book}/>}/>
                    </Routes>
                    <Outlet/>
                </AppShell.Main>
            </AppShell>

        </EditorContext.Provider>
    );
};
