import {Book} from "@src/types.ts";
import {useAppContext} from "@src/App.context.ts";

export const Characters = ({book}:{book:Book}) => {

    const {characterBroker} = useAppContext()

    const {data, isLoading, isError} = characterBroker.list(book)

    return (
        <>
            <h2>Characters!</h2>
            <p>{data?.length}</p>
            <p>{isLoading} and {isError}</p>
        </>
    )
}
