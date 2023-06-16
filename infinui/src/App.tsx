import { useState } from 'react'
import {AppShell, Navbar} from "@mantine/core";
import {useQuery} from "@tanstack/react-query";

import {Boundary} from "./lib/boundary.ts";
import APIBridge from './lib/api_bridge.ts';
import DirectoryMenu from "./DirectoryMenu.tsx";
import Book from "./Book.tsx";


function App() {

    const boundary = new Boundary();
    const bridge = new APIBridge(boundary);


    const fetchBookManifest = () =>{
      return useQuery({
            queryKey: ["chapters"],
            queryFn: bridge.fetch_stripped_chapters.bind(bridge)
        });
    }

    //Short circuit here with ProjectMenu (Create a new book or load an old one)


    const {isLoading, error, data:bookManifest} = fetchBookManifest();

    if(isLoading) return "Loading...";

    if(error) return "An error occurred:" + error.message;


    const navMenu = (
        <Navbar style={{zIndex:10}} width={{base:210}} p="xs">
            <DirectoryMenu
                bridge={bridge}
                bookManifest={bookManifest}
            />
        </Navbar>
    )


    return (
      <AppShell
            padding="md"
           navbar={navMenu}
      >
          <Book chapters={bookManifest}/>
      </AppShell>
    );
}

export default App
