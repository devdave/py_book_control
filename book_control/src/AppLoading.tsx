import {useEffect, useState} from "react";
import App from "./App.tsx";
import {LoadingOverlay} from "@mantine/core";
import {PYWEBVIEWREADY} from "./lib/boundary.ts";


export const AppLoading = () => {

    const [isReady, setIsReady] = useState<boolean>(false);

    const bridgeReady = () => {
        setIsReady(true);
        window.removeEventListener(PYWEBVIEWREADY, bridgeReady);
    }

    useEffect(()=>{
        window.addEventListener(PYWEBVIEWREADY, bridgeReady)
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
