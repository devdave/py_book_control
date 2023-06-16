import App from "./App.tsx";
import {useEffect, useState} from "react";
import {LoadingOverlay} from "@mantine/core";
import {PYWEBVIEWREADY} from "./lib/boundary.ts";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";


const queryClient = new QueryClient();
const AppLoading = () => {

  const [isReady, setIsReady] = useState(false);

  const onConnect = () => {
    setIsReady(true);
    window.removeEventListener(PYWEBVIEWREADY, onConnect);
  }

  useEffect(()=>{
    if(window.pywebview == undefined || window.pywebview.api == undefined){
      window.addEventListener(PYWEBVIEWREADY, onConnect);
    } else {
      setIsReady(true);
    }
  },[]);


  if(isReady == true){
    return (
        <QueryClientProvider client={queryClient}>
          <App/>
        </QueryClientProvider>
    );
  } else {
    return (
        <LoadingOverlay visible={true}/>
    )
  }

}

export default AppLoading;