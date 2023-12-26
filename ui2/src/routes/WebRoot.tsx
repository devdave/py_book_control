import {
    createBrowserRouter, NavLink as RoutedLink,
    Route,
    RouterProvider,
    Routes, useLocation,
} from "react-router-dom";
import { useHotkeys } from "@mantine/hooks";
import {useMantineColorScheme} from "@mantine/core";


import { Manifest } from "@src/routes/entry/Manifest.tsx";
import { NotFound } from "@src/routes/NotFound.tsx";
import { Editor } from "@src/routes/editor/Editor.tsx";
import ScrollToAnchor from "@src/lib/ScrollToAnchor.tsx";
import {ErrorPage} from "@src/routes/ErrorPage.tsx";
import {useEffect, useMemo, useState} from "react";
import {WebRootContext} from "@src/routes/WebRoot.context.ts";



export const Root = () => {
    const { toggleColorScheme } = useMantineColorScheme();

    ScrollToAnchor()

    useHotkeys([["mod+J", () => toggleColorScheme()]]);

    const location = useLocation();
    const [crumbs, setCrumbs] = useState<React.ReactElement[]>([])


    useEffect(() => {
        if(location.state && location.state.title){
            setCrumbs((crumbs)=>{
                const newCrumbs = [...crumbs, (
                    <RoutedLink to={`${location.pathname}${location.hash}`}>{location.state.title}</RoutedLink>
                )]
                if(newCrumbs.length > 4){
                    newCrumbs.shift()
                }
                return newCrumbs
            })
        }
    }, [location]);

    const WebRootContextValues = useMemo(()=>
        ({
            crumbs
        }),[crumbs])


    return (
        <WebRootContext.Provider value={WebRootContextValues}>
            <Routes>
                <Route path="/" element={<Manifest />} errorElement={<ErrorPage/>} />
                <Route path="/book/:book_id/*" element={<Editor />} errorElement={<ErrorPage/>}/>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </WebRootContext.Provider>
    );
};

const router = createBrowserRouter([
    { path: "*", Component: Root, errorElement: <ErrorPage /> },
]);

export const WebRoot = () => {
    return <RouterProvider router={router} />;
};
