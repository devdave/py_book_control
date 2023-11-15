
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

export const WebRoot = () => {

    return (
        <Router>
            <h1>Hello world!</h1>

            <Routes>
                <Route path="/" element={<Home/>}/>
            </Routes>
        </Router>
    )
}



const Home = () => {

    return (
        <h2>Home component!</h2>
    )
}
