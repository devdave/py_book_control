import Menu from "./Menu.tsx";
import {AppShell, Navbar} from "@mantine/core";
import {useQuery, QueryClient} from "@tanstack/react-query";
import {Boundary} from "./lib/boundary.ts";
import APIBridge from "./lib/api_bridge.ts";


function App() {

    const queryClient = new QueryClient();
    const boundary = new Boundary()
    const api = new APIBridge(boundary);

    const {data:chapters, error, isLoading } = useQuery({
        queryKey: ["book", 1],
        queryFn: api.fetch_stripped_chapters
    });


    const menuBar = (
        <Navbar>
            <Menu chapters={chapters} />
        </Navbar>
    )

    return(
    <AppShell navbar={menuBar}>
        <h1>App</h1>
        <div>{chapters.length}</div>
    </AppShell>
  )
}

export default App
