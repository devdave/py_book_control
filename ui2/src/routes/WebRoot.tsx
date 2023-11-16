
import {font_set} from "@src/lib/font_set.ts";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import {Main} from "@src/routes/main/Main.tsx";
import { useQueryClient } from "@tanstack/react-query";
import {useCallback, useEffect, useState} from "react";

const RootRouter = () => {
  return (
        <Router>
            <h1>Hello world!</h1>
            <Routes>
                <Route path="/" element={<Main/>}/>
            </Routes>
        </Router>
    )
}

export const WebRoot = () => {
    const queryClient = useQueryClient()

    const [fonts, setFonts] = useState<Set<string>>(new Set())


    /**
     * FONT STUFF
     */
    const checkFonts = useCallback(() => {
        const fontAvailable = new Set<string>()

        // eslint-disable-next-line no-restricted-syntax
        for (const font of font_set.values()) {
            if (document.fonts.check(`12px "${font}"`)) {
                fontAvailable.add(font)
            }
        }
        setFonts(fontAvailable)
    }, [])

    useEffect(() => {
        document.fonts.ready.then(() => {
            checkFonts()
        })
    }, [])

    

    return (
        <>
            <RootRouter/>
        </>
    )

}


