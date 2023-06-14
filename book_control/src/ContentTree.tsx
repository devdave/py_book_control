import {Chapter} from "./types.ts";
import {InputModal} from "./lib/input_modal.tsx";

import {FC, useState} from "react";

import {Tree, NodeRendererProps, NodeApi, MoveHandler} from "react-arborist";
import {Button, Group} from "@mantine/core";
import {Boundary} from "./lib/boundary.ts";


type setActiveType = (element: Chapter) => void;



const Node: FC<NodeRendererProps<Chapter>> = ({node, style, dragHandle}) => {
    /* This node instance can do many things. See the API reference. */

    const isSelected = node.isSelected;
    const isOpen = node.isOpen;
    // const isChapter = node.data.targetType === "chapter" ? true : false;

    const nodeClass = isSelected ? "selectedCell" : "";


    // const rightArrow = "˃";
    // const downArrow = "˅";
    const parentIcon = isOpen ? (isSelected ? "📂" : '🗁') : (isSelected ? '📁' : "🗀");
    const sceneIcon = isSelected ? '📝' : "🗎";
    // const arrowIcon = isOpen ? downArrow : rightArrow;


    return (
        <div style={style} ref={dragHandle} className={nodeClass}>
            {node.data.type === "chapter" ? parentIcon : sceneIcon}
            {node.data.name}
        </div>
    );
}

interface ContentTreeProps {
    boundary: Boundary,
    chaptersData: Chapter[],
    updateActiveElement: setActiveType
};

export const ContentTree: FC<ContentTreeProps> = ({createChapter, createScene, chaptersData ,updateActiveElement}) => {

    const [currentType, setCurrentType] = useState("");
    const [currentId, setCurrentid] = useState("");

    const onMove: MoveHandler<Chapter> = ({dragNodes, parentNode, index}) => {
        console.log("moved", dragNodes, parentNode, index);
    };

    const onSelect = (nodes: NodeApi<Chapter>[]) => {

        const node = nodes[0];

        console.info("selected", node, typeof node);
        if (node) {
            //only toggle if the element is already selected
            if(node.isSelected){
                // node.toggle();
            }


            if (node.data) {
                setCurrentid(node.data.id);
                setCurrentType(node.data.type);
                updateActiveElement(node.data);
            }
        }


    }

    const modal = new InputModal();
    const onCreateChapter = () =>{
        modal.run(doCreateChapter, "Create a new chapter");
    }

    async function doCreateChapter(chapterName:string) {
        if(chapterName){
            console.log("Creating new chapter", chapterName);
            createChapter.mutate(chapterName);
        }

    }

    const onCreateScene = () => {
        modal.run(doCreateScene, "Create a new scene")
    }

    async function doCreateScene(sceneName:string) {
        if(currentType == "chapter") {

            createScene.mutate([currentId, sceneName]);
        }

    }


    if(chaptersData == undefined || chaptersData?.length <= 0){
        return (
            <Group position={"left"}>
                <Button onClick={onCreateChapter}>Add chapter</Button>
            </Group>
        )
    }

    return (
        <>
            <Group position={"left"}>
                <Button onClick={onCreateChapter}>Add chapter</Button>
                {currentType == "chapter" &&
                <Button onClick={onCreateScene}>Add Scene</Button>
                }
            </Group>
            <Tree
                width={150}
                data={chaptersData}
                disableMultiSelection={true}
                onMove={onMove}
                onSelect={onSelect}
                disableDrop={false}
                childrenAccessor={(data)=>data?.scenes}
            >
                {Node}
            </Tree>

        </>


    );
}