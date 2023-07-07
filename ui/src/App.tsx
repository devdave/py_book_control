import Boundary, {PYWEBVIEWREADY} from "@src/lib/boundary";
import APIBridge from '@src/lib/remote';
import {ThemeProvider} from '@src/ThemeProvider'
import {Editor} from '@src/modes/edit/Editor'
import {AppContext, AppContextValue} from '@src/App.context'

import {ReactNode, useEffect, useMemo, useState} from "react";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'

import {LoadingOverlay, Text} from "@mantine/core";
import {AppModes, Book, Font} from "@src/types";
//import APIBridge from "./lib/remote";


const queryClient = new QueryClient();


declare global {
    interface window {
        pywebview: any;
    }

}

interface AppWrapperProps {
    value: AppContextValue
    children: ReactNode
}

const AppWrapper: React.FC<AppWrapperProps> = ({value, children}) => {

    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <AppContext.Provider value={value}>
                    {children}
                </AppContext.Provider>
                <ReactQueryDevtools initialIsOpen={false}/>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

export default function App() {

    const [appMode, setAppMode] = useState(AppModes['MANIFEST']);

    const [isReady, setIsReady] = useState(false);
    const [activeBook, setActiveBook] = useState<Book>({
        chapters: [],
        created_on: "",
        id: "",
        notes: "",
        title: "NotSet",
        updated_on: "",
        words: 0
    });

    const [fonts, setFonts] = useState<Set<string>>(new Set());
    const [activeFont, setActiveFont] = useState<Font>({size: "", weight: "", name: "notset"});


    const boundary = new Boundary()
    const api = new APIBridge(boundary);


    const doReady = async () => {

        const bookData: Book = await api.get_current_book();

        setActiveBook(bookData)
        console.log("Book data", bookData);

        setIsReady(true);
    }


    const checkFonts = () => {
        const fontCheck = new Set([
            // Windows 10
            'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
            // macOS
            'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
        ].sort());

        const fontAvailable = new Set<string>();

        for (const font of fontCheck.values()) {
            if (document.fonts.check(`12px "${font}"`)) {
                fontAvailable.add(font);
            }
        }
        setFonts(fontAvailable);

        console.log('Available Fonts:', [...fontAvailable.values()]);
    }


    useEffect(() => {
        //@ts-ignore Fuck the hell off with this window not defined shit
        if (window.pywebview !== undefined && window.pywebview.api !== undefined) {
            doReady();
        } else {
            window.addEventListener(PYWEBVIEWREADY, doReady, {once: true});
        }
    }, []);

    useEffect(() => {

        document.fonts.ready.then((fontFaceSet) => {
            checkFonts();
            if(fonts.has("Arial")){
                setActiveFont(prev=>({
                    name: "Arial",
                    size: "12",
                    weight: "100"
                }))
            }
        })

    }, []);


    if (!isReady) {
        return (
            <LoadingOverlay visible={true}/>
        )
    }

    const AppContextValue = useMemo<AppContextValue>(
        () => ({
            api,
            appMode,
            setAppMode,
            activeBook,
            setActiveBook,
            fonts,
            setFonts,
            activeFont,
            setActiveFont,
        }),
        [api]
    )

    if (appMode == AppModes.MANIFEST) {
        return (
            <AppWrapper value={AppContextValue}>
                <Text>Manifest</Text>
            </AppWrapper>
        )
    } else if (appMode == AppModes.EDITOR) {
        return (
            <AppWrapper value={AppContextValue}>
                <Editor/>
            </AppWrapper>
        )
    } else if (appMode == AppModes.STATS) {
        return (
            <AppWrapper value={AppContextValue}>
                <Text>Stats</Text>
            </AppWrapper>
        )
    } else {
        return (
            <AppWrapper value={AppContextValue}>
                <Text>Unknown app mode {appMode}</Text>
            </AppWrapper>
        )
    }


    //Next step would be to show a Modal list "Use last book", "select another book", "Create a book"

}
