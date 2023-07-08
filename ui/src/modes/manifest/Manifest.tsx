import {Header, Paper, Skeleton, Stack, Table, Text, Title} from "@mantine/core";
import {useAppContext} from "@src/App.context";
import {useQuery} from "@tanstack/react-query";
import {AppModes, Book} from "@src/types";
import {MouseEventHandler, useState} from "react";

import "./manifest.css";


export const Manifest = () => {

    const {api, setActiveBook, setAppMode} = useAppContext();

    const [highlightBookID, setHighLightBookID] = useState<string | undefined>();

    const {data: books, isLoading: booksAreLoading} = useQuery({
        queryFn: () => api.list_books(true),
        queryKey: ["books", "index"]
    });

    const {
        data: highlightedBook,
        status: highlightStatus,
        isFetched: highlightedIsFetched,
        isLoading: highlightedIsLoading
    } = useQuery({
        queryFn: () => api.fetch_book_simple(highlightBookID),
        queryKey: ['book', highlightBookID],
        enabled: highlightBookID !== undefined
    });


    if (booksAreLoading) {
        return (
            <>
                <Skeleton/>
                <Skeleton/>
                <Skeleton/>
            </>
        )
    }

    const handleBookClick:MouseEventHandler<HTMLElement> = async (evt) => {
        const bookId = evt.currentTarget.dataset.bookId;
        if(bookId == undefined){
            console.error("Got a bad bookId for ", evt);
            return;
        }

        console.log("Clicked on", bookId);
        const response = await api.set_current_book(bookId);
        const book = await api.fetch_book_simple(bookId);
        setActiveBook(book);
        console.log("Set activeBook to ", book);
        setAppMode(AppModes.EDITOR);

    }

    const handleMouseEnter:MouseEventHandler<HTMLElement> = (evt) => {
        evt.currentTarget.classList.add("highlight");
        setHighLightBookID(evt.currentTarget.dataset.bookId);
    }

    const handleMouseLeave:React.MouseEventHandler<HTMLElement> = (evt) => {
        evt.currentTarget.classList.remove("highlight");
        setHighLightBookID(undefined);
    }


    return <Stack p={"md"}>
        <Header height={60}>
            <Title order={1}>Open or create a new book</Title>
        </Header>


        <fieldset>
            <legend>Books</legend>
            <Table>
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Word count</th>
                    <th>Chapters</th>
                    <th>Updated at</th>
                    <th>Created at</th>
                </tr>
                </thead>
                <tbody>
                {books.map((book: Book) =>
                    <tr className="bookrow" data-book-id={book.id} key={book.id} onClick={handleBookClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}>
                        <td>{book.title}</td>
                        <td>{book.words}</td>
                        <td>{book.chapters && book.chapters.length}</td>
                        <td>{book.updated_on}</td>
                        <td>{book.created_on}</td>
                    </tr>
                )}
                </tbody>
            </Table>
        </fieldset>
        <Title order={5}>Chapter notes</Title>
        {/*{highlightBookID}, {JSON.stringify(highlightedBook)}, {highlightedIsLoading ? 'true' : 'false'}, {highlightStatus}, {highlightedIsFetched ? 'true' : 'false'}*/}
        <Paper shadow="lg" p="md" withBorder>
            {function () {
                if (highlightBookID == undefined) {
                    return <Text>Hover over a book to see its notes</Text>
                }
                if (highlightedBook) {
                    if (highlightedBook.notes.length <= 0) {
                        return (
                            <Text>There are no notes</Text>
                        )
                    }
                    if (highlightedBook.notes.length > 0) {
                        return (
                            <Text>Notes: {highlightedBook.notes}</Text>
                        )
                    }
                }
                return (
                    <Text>Failed to fetch book notes.</Text>
                )

            }()}
        </Paper>
    </Stack>
}