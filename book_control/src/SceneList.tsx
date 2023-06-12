import {Scene} from "./types.ts";
import {useMemo} from "react";
import {MantineReactTable, MRT_ColumnDef, MRT_Row} from "mantine-react-table";

interface SceneListProps {
    chapterId: string,
    scenes: Scene[]
}
export const SceneList:React.FC<SceneListProps> = ({chapterId, scenes}) => {

    const columns = useMemo<MRT_ColumnDef<Scene>[]>(
        ()=> [
            {
                accessorKey: "name",
                header: "Name"
            }
        ],
        []
    );

    const data = [
        {
            id: "abc123456",
            name: "scene1"
        },
        {
            id: "ch45",
            name: "scene2"
        },
        {
            id:"ab234",
            name: "scene2"
        },
    ]

    return (
        <MantineReactTable
            columns={columns}
            data={data}
            enableTopToolbar={false}
            enableBottomToolbar={false}
            enableMultiRowSelection={false}
            enableRowSelection={true}
            enableSelectAll={false}
            mantineTableBodyRowProps={({
                                               row
                                           }) => ({
                    onClick: row.getToggleSelectedHandler(),
                    sx: {
                        cursor: 'pointer'
                    }
                })}

        />
    )
}