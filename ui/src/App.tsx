import {ThemeProvider} from './ThemeProvider'
import {Book} from './Book'
import {useEffect, useState} from "react";

import {ModalsProvider} from "@mantine/modals";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import Boundary, {PYWEBVIEWREADY} from "./lib/boundary";
import {LoadingOverlay} from "@mantine/core";
import APIBridge from "./lib/remote";


const queryClient = new QueryClient();


declare global {
    interface window {
        pywebview: any;
    }

}

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [bookTitle, setBookTitle] = useState(undefined);
    const [bookId, setBookId] = useState(undefined);

    const [fonts, setFonts] = useState<string[]>([]);
    const [activeFont, setActiveFont] = useState<string|undefined>(undefined);

    const boundary = new Boundary()
    const api = new APIBridge(boundary);



    const doReady = async () => {

        const bookData = await api.get_current_book();
        setBookId(bookData.id);
        setBookTitle(bookData.title);
        console.log("Book data", bookData);

        setIsReady(true);
        window.removeEventListener(PYWEBVIEWREADY, doReady);

    }


    const checkFonts = () => {
        const fontCheck = new Set([
              // Windows 10
            'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
              // macOS
              'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
            ].sort());

        const fontAvailable = new Set();

      for (const font of fontCheck.values()) {
        if (document.fonts.check(`12px "${font}"`)) {
          fontAvailable.add(font);
        }
      }

        console.log('Available Fonts:', [...fontAvailable.values()]);
    }


    useEffect(() => {
        //@ts-ignore Fuck the hell off with this window not defined shit
        if (window.pywebview !== undefined && window.pywebview.api !== undefined) {
            doReady();
        } else {
            window.addEventListener(PYWEBVIEWREADY, doReady);
        }
    },[]);

    useEffect(()=>{

        document.fonts.ready.then((fontFaceSet)=>{
            checkFonts();
        })

    },[]);


    if(!isReady){
        return (
            <LoadingOverlay visible={true}/>
        )
    }


    //Next step would be to show a Modal list "Use last book", "select another book", "Create a book"
    return (
        <ModalsProvider>
            <ThemeProvider>
                <QueryClientProvider client={queryClient}>
                    <Book api={api} bookId={bookId} bookTitle={bookTitle}/>
                    <ReactQueryDevtools initialIsOpen={false}/>
                </QueryClientProvider>
            </ThemeProvider>
        </ModalsProvider>
    )
}
