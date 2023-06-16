import {useEffect, useState} from "react";
import App from "./App.tsx";
import {LoadingOverlay} from "@mantine/core";
import {PYWEBVIEWREADY} from "./lib/boundary.ts";
import app from "./App.tsx";


export const AppLoading = () => {

    const [isReady, setIsReady] = useState<boolean>(false);

    const bridgeReady = () => {
        setIsReady(true);
        window.removeEventListener(PYWEBVIEWREADY, bridgeReady);
    }

    useEffect(()=>{
        if(window.pywebview == undefined || window.pywebview.api == undefined) {
            window.addEventListener(PYWEBVIEWREADY, bridgeReady)
        } else {
            setIsReady(true);
        }

    }, []);


    if(isReady) {
        return (
            <App/>
        )
    } else {
        return (
            <LoadingOverlay visible />
        )
    }


}
