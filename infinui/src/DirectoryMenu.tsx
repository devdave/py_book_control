import APIBridge from "./lib/api_bridge.ts";

import {Tree, NodeRendererProps, NodeApi} from "react-arborist";
import {NavLink} from "@mantine/core";
import {IconFolder, IconArticle} from "@tabler/icons-react";

interface BookElement {
    id:string
    name:string
    type:string
    scenes:BookElement
}


const MenuNode:React.FC<NodeRendererProps<BookElement>> = ({node, style, dragHandle}) => {
    const isSelected = node.isSelected;
    const isOpen = node.isOpen;
    const nodeType = node.data.type;
    // const isChapter = node.data.targetType === "chapter" ? true : false;

    const nodeClass = isSelected ? "selectedCell" : "";

    const parentIcon = isOpen ? (isSelected ? "📂" : '🗁') : (isSelected ? '📁' : "🗀");
    const sceneIcon = isSelected ? '📝' : "🗎";

    const nodeIcon = nodeType === "chapter" ? parentIcon : sceneIcon;


    return (
        <div style={style} ref={dragHandle} className={nodeClass}>
            {nodeIcon}
            {node.data.name}
        </div>
    );
}

interface DirectoryMenuProps {
    bridge:APIBridge
    bookManifest:BookElement[]
}
const DirectoryMenu:React.FC<DirectoryMenuProps> = ({bookManifest}) => {


    const scrollTo = (type: string, id: string) => {
        return function handler(evt:any) {
            console.log("Clicked", type, id);
            const elId = `${type}-${id}`;
            const element = document.getElementById(elId);
            if(element){
                element.scrollIntoView({behavior:"smooth"});
            }
        };
    }

    return (
        <NavLink label="Book: Name here" opened>
            {bookManifest.map(chapter=>
                <NavLink key={chapter.id} icon={<IconFolder/>} label={`${chapter.name}-${chapter.scenes?.length}-${chapter?.words || 0}`} opened={true} onClick={scrollTo("chapter", chapter.id)}>

                {chapter?.scenes?.map(scene=>
                    <NavLink key={scene.id} icon={<IconArticle/>} label={`${scene.name}-${scene?.words}`} onClick={scrollTo('scene', scene.id)}></NavLink>
                )}
                </NavLink>
            )}
        </NavLink>
    )
}

export default DirectoryMenu;