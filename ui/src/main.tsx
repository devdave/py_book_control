import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

const queryClient = new QueryClient()

const Main = () => (
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
)

ReactDOM.createRoot(document.getElementById('root')!).render(Main())
