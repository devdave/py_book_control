import {Boundary} from "./lib/boundary.ts";
import React from "react";
import {Tabs} from "@mantine/core";
import {IconTank} from "@tabler/icons-react";


interface RightPanelProps {
    boundary: Boundary;
    activeChapter: string,

}

export const RightPanel:React.FC<RightPanelProps> = () => {



    return (
      <Tabs variant="outline" defaultValue="scenes">
          <Tabs.List>
              <Tabs.Tab value="scenes">Scenes</Tabs.Tab>
              <Tabs.Tab value="notes">Chapter notes</Tabs.Tab>
              <Tabs.Tab value="Characters">Characters</Tabs.Tab>
              <Tabs.Tab value="locations">Locations</Tabs.Tab>
          </Tabs.List>
      </Tabs>
    );

}