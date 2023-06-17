import App from "./App.tsx";
import {useEffect, useState} from "react";
import {LoadingOverlay} from "@mantine/core";

const Apploading = ({}) => {

    const [isReady, setIsReady] = useState(false);

    const handleLoaded = () => {
        setIsReady(true);
        window.removeEventListener("pywebviewready");
    }

    useEffect(()=>{
        if(window.pywebview != undefined && window.pywebview.api != undefined){
            setIsReady(true);
        } else {
            window.addEventListener("pywebviewready", handleLoaded);
        }
    })

    if(isReady === true){
        return (
            <App/>
        )
    } else {
        return (
            <LoadingOverlay visible={true}/>
        )
    }



}