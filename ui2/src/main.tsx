import React from 'react'
import ReactDOM from 'react-dom/client'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {WebRoot} from "@src/routes/WebRoot.tsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity
        }
    }
})

const Main = () => (
    <QueryClientProvider client={queryClient}>
        <React.StrictMode>
            <WebRoot />
        </React.StrictMode>
    </QueryClientProvider>
)

ReactDOM.createRoot(document.getElementById('root')!).render(Main(),)
