import {Chapter} from "./types.ts";
import {GenerateRandomString} from "./lib/utils.ts";
import {Boundary} from "./lib/boundary.ts";

import React, {useMemo} from "react";
import {InputModal} from "./lib/input_modal.tsx";
import {MantineReactTable, MRT_ColumnDef, MRT_Row} from "mantine-react-table";

type DS<Type> = React.Dispatch<React.SetStateAction<Type>>

export interface ListChaptersProps {
    boundary: Boundary,
    chapters: Chapter[],
    setChapters: DS<Chapter[]>,
    activeChapter: string | null,
    setActiveChapter: DS<string | null>
}

export const ListChapters: React.FC<ListChaptersProps> = ({
                                                              boundary,
                                                              chapters,
                                                              setChapters,
                                                              activeChapter,
                                                              setActiveChapter
                                                          }) => {

    const columns = useMemo<MRT_ColumnDef<Chapter>[]>(
        () => [
            // {
            //     accessorKey: "id",
            //     header: "ID",
            //     enableEditing: false,
            //     enableColumnOrdering: false,
            //     enableSorting: false,
            //     enableHiding: true
            // },
            // {
            //     accessorKey: "order",
            //     header: "Order",
            //     enableEditing: false,
            //     enableColumnOrdering: false,
            //     enableSorting: false,
            //
            // },
            {
                accessorKey: "name",
                header: "Name",
                maxSize: 80
            },
            {
                accessorKey: "scenes",
                header: "S",
                maxSize: 25
            },
            {
                accessorKey: "words",
                header: "W",
                maxSize: 25
            }
        ],
        []
    );


    let newChapterModal = new InputModal();

    const showChapterCreate = () => {
        newChapterModal.run(createChapter);
    }
    const createChapter = (chapterName: string) => {


        const my_id = GenerateRandomString(12);

        const order_pos = chapters.length;

        const new_chapter: Chapter = {
            id: my_id,
            name: chapterName,
            order: order_pos,
            words: 0,
            scenes: []
        };

        console.log(new_chapter);
        boundary.remote("create_chapter", new_chapter).then(
            ()=>{
                setActiveChapter(my_id);
                setChapters([...chapters, new_chapter]);
            }
        ).catch(()=>{
            alert("Failed to save new chapter!")
        });




    }

    const deleteChapter = (chapterId: string) => {
        setChapters(chapters.filter(chapter => chapter.id !== chapterId));
    }

    const onDragEnd = (draggedRow: MRT_Row<Chapter>, hoveredRow: MRT_Row<Chapter>) => {

        let copiedChapters: Chapter[] = ([] as Chapter[]).concat(chapters);

        copiedChapters.splice( hoveredRow.index,0, copiedChapters.splice(draggedRow.index, 1)[0]);

        const reorderedChapters = copiedChapters.map<Chapter>((value, key)=> {
            value.order = key;
            return value;
        });
        setChapters(reorderedChapters);
        boundary.remote("save_reordered_chapters", reorderedChapters);

    }


    return (
        <>


            <MantineReactTable
                columns={columns}
                data={chapters}
                enableRowOrdering={true}
                enableMultiRowSelection={false}
                enableRowSelection={true}
                enableSelectAll={false}
                getRowId={(originalRow)=> originalRow.id}
                enableRowDragging={true}
                mantineRowDragHandleProps={({table}) => ({
                    onDragEnd: () => {
                        const {draggingRow, hoveredRow} = table.getState();
                        if (draggingRow && hoveredRow) {
                            onDragEnd(draggingRow, hoveredRow as MRT_Row<Chapter>);
                        }
                    }
                })
                }
                initialState={{columnVisibility: {
                        id: false,
                        order: false,
                    }
                }}
                renderTopToolbarCustomActions={()=> (
                    <button onClick={showChapterCreate}>New Chapter</button>
                )}


                enableColumnActions={false}
                enableColumnFilters={false}
                enablePagination={false}
                enableSorting={false}
                enableBottomToolbar={false}
                enableTopToolbar={true}
                mantineTableProps={{
                    highlightOnHover: false,
                    withColumnBorders: true,
                }}
            />
        </>
    )
}