import {Textarea, Paper, Group, Button} from "@mantine/core";
import ChapterNode from "./ChapterNode.tsx";

interface BookElement {
    id:string
    type:string
    name:string
    order:number
    scenes:BookElement

}

interface BookProps {
    chapters: BookElement[]
}

const Book:React.FC<BookProps> = ({chapters}) => {

    return (
        <div style={{zIndex:100}}>
            <h1>Book contents</h1>
            <Group position="center"><Button compact={true} size="sx">Append chapter</Button></Group>
            {chapters.map((chapter)=>
                <Paper key={chapter.id}>
                        <ChapterNode chapter={chapter}/>
                </Paper>
            )}
            <br/>
            <Group position="center"><Button compact={true} size="sx">Add chapter</Button></Group>
        </div>
    )
}

export default Book;