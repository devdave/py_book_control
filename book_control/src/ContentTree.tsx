import {TargetedElement} from "./types.ts";
import {FC} from "react";

import {Tree, NodeRendererProps, NodeApi, MoveHandler} from "react-arborist";

type setElementsType = (elements: TargetedElement[]) => void;
type setActiveType = (element: TargetedElement) => void;

interface ContentTreeProps {
    elements: TargetedElement[],
    setElements: setElementsType,
    updateActiveElement: setActiveType
};

const Node: FC<NodeRendererProps<TargetedElement>> = ({node, style, dragHandle}) => {
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
            {node.data.targetType === "chapter" ? parentIcon : sceneIcon}
            {node.data.name}
        </div>
    );
}

export const ContentTree: FC<ContentTreeProps> = ({elements, updateActiveElement}) => {

    const onMove:MoveHandler<TargetedElement> = ({dragNodes, parentNode, index}) => {
        console.log("moved", dragNodes, parentNode, index);
    };

    const onSelect = (nodes:NodeApi<TargetedElement>[]) => {

        const node = nodes[0];

        console.info("selected", node, typeof node);
        if (node) {
            node.toggle();

            if(node.data){
                updateActiveElement(node.data);
            }
        }


    }

    return (
        <Tree
            width={150}
            data={elements}
            disableMultiSelection={true}
            onMove={onMove}
            onSelect={onSelect}
            disableDrop={false}
        >
            {Node}
        </Tree>

    );
}