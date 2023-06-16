import React from 'react'
import ReactDOM from 'react-dom/client'

import {MantineProvider} from "@mantine/core";

import AppLoading from './AppLoading.tsx'


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <MantineProvider withGlobalStyles withNormalizeCSS>
        <React.StrictMode>
            <AppLoading/>
        </React.StrictMode>
    </MantineProvider>
)
