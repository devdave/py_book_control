import {Book} from "@src/types.ts";

export const BookOverview = ({book}:{book:Book}) => {

    return (
        <>
            <h2>Book!</h2>
            <i>
                Book is <pre style={{ width:'70vw', wordWrap:"break-word"}} >{JSON.stringify(book,null,4)}</pre>
            </i>
        </>
    )


}
