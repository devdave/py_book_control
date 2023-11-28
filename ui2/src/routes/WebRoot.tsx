import {
    createBrowserRouter,
    Route,
    RouterProvider,
    Routes,
} from "react-router-dom";
import { useHotkeys } from "@mantine/hooks";
import { useMantineColorScheme } from "@mantine/core";

import { Manifest } from "@src/routes/entry/Manifest.tsx";
import { NotFound } from "@src/routes/NotFound.tsx";
import { Editor } from "@src/routes/editor/Editor.tsx";

export const Root = () => {
    const { toggleColorScheme } = useMantineColorScheme();

    useHotkeys([["mod+J", () => toggleColorScheme()]]);
    return (
        <Routes>
            <Route path="/" element={<Manifest />} />
            <Route path="/book/:book_id" element={<Editor />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

const router = createBrowserRouter([
    { path: "*", Component: Root, errorElement: <NotFound /> },
]);

export const WebRoot = () => {
    return <RouterProvider router={router} />;
};
