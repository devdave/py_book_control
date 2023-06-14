import React from 'react'
import ReactDOM from 'react-dom/client'
import {MantineProvider} from '@mantine/core';
import {ModalsProvider} from '@mantine/modals';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

import {AppLoading} from "./AppLoading.tsx";

import './index.css'

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <MantineProvider withGlobalStyles withNormalizeCSS>
                <ModalsProvider>
                    <AppLoading/>
                </ModalsProvider>
            </MantineProvider>
        </QueryClientProvider>
    </React.StrictMode>,
)
