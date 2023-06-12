import {Chapter, TargetedElement} from "./types.ts";
import {GenerateRandomString} from "./lib/utils.ts";
import {Boundary} from "./lib/boundary.ts";

import React, {useMemo, useState} from "react";
import {InputModal} from "./lib/input_modal.tsx";
import {MantineReactTable, MRT_ColumnDef, MRT_Row} from "mantine-react-table";


type DS<Type> = React.Dispatch<React.SetStateAction<Type>>

export interface ListChaptersProps {
    boundary: Boundary,
    elements: TargetedElement[]
    setElements: DS<TargetedElement[]>,
    setActiveElement: DS<TargetedElement>

}

export const ListChapters: React.FC<ListChaptersProps> = ({
                                                              boundary,
                                                              elements,
                                                              setElements,
                                                              setActiveElement
                                                          }) => {


    const columns = useMemo<MRT_ColumnDef<TargetedElement>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Chapter->Scenes",
                maxSize: 80,
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

        const new_chapter: TargetedElement = {
            name: chapterName,
            words: 0,
            targetType: "Chapter",
            targetId: my_id,
            children: [
                {
                    name: "Scene 1",
                    words: 0,
                    targetType: "Scene",
                    targetId: "abs123",
                    children: []
                },


            ]
        }

        setElements([...elements, new_chapter]);

        // const new_chapter: Chapter = {
        //     id: my_id,
        //     name: chapterName,
        //     order: order_pos,
        //     words: 0,
        //     scenes: [
        //         {
        //             id: GenerateRandomString(7),
        //             name: "Scene1",
        //             words: 0,
        //             locations: [],
        //             characters: [],
        //             desc: "A blank chapter",
        //             content:"",
        //             order: 0,
        //             notes: "no notes"
        //
        //         },
        //         {
        //             id: GenerateRandomString(7),
        //             name: "Scene2",
        //             words: 0,
        //             locations: [],
        //             characters: [],
        //             desc: "A blank chapter",
        //             content:"",
        //             order: 1,
        //             notes: "no notes"
        //         },
        //     ]
        // };

        // console.log(new_chapter);
        // boundary.remote("create_chapter", new_chapter).then(
        //     () => {
        //         setActiveChapter(my_id);
        //         setChapters([...chapters, new_chapter]);
        //     }
        // ).catch(() => {
        //     alert("Failed to save new chapter!")
        // });


    }


    return (
        <>

            <MantineReactTable
                columns={columns}
                data={elements}
                enableRowOrdering={false}
                enableMultiRowSelection={false}
                enableRowSelection={true}
                enableSelectAll={false}


                initialState={{
                    columnVisibility: {
                        children: false,
                    },
                    expanded: true
                }}
                renderTopToolbarCustomActions={() => (
                    <button onClick={showChapterCreate}>New Chapter</button>
                )}
                enableExpanding={true}
                enableExpandAll={false}
                getSubRows={(row, index) => row.children}


                enableColumnActions={false}
                enableColumnFilters={false}
                enablePagination={false}
                enableSorting={false}
                enableBottomToolbar={false}
                enableTopToolbar={true}
                mantineTableProps={{
                    highlightOnHover: false,
                    withColumnBorders: true
                }}
                mantineTableBodyRowProps={({
                                               row
                                           }) => ({
                    onClick: row.getToggleSelectedHandler(),
                    sx: {
                        cursor: 'pointer'
                    }
                })}

            />
        </>
    )
}