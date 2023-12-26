import {To, useNavigate} from "react-router-dom";

export const useSmartNavigate = () => {

    const navigate = useNavigate()

    return (path: To, title: string)=>{
        return navigate(path, {state:{title:title}})
    }

}
