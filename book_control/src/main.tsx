import React from 'react'
import ReactDOM from 'react-dom/client'
import {MantineProvider} from '@mantine/core';
import {ModalsProvider} from '@mantine/modals';

import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <ModalsProvider>
                <App/>
            </ModalsProvider>
        </MantineProvider>
    </React.StrictMode>,
)
