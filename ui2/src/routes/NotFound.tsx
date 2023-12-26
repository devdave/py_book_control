import {ErrorResponse, Link, useRouteError} from "react-router-dom";
import {Stack} from "@mantine/core";

export const NotFound = () => {
    const error: unknown = useRouteError() as ErrorResponse;
    console.error((error as Error)?.message ||
            (error as { statusText?: string })?.statusText);

    return (
        <Stack>
            <h1>Oops</h1>
            <div>
                <p>Sorry but I've jumped the train tracks somehow and couldn't find that</p>
            </div>
            <div>
                <p>
                    <i>
                        {(error as Error)?.message || (error as { statusText?: string })?.statusText}
                    </i>
                    <br />
                </p>
            </div>
            <div>Location: {window.location.href}</div>
            <div    ><Link to={"/"}>Back to start</Link></div>
        </Stack>
    );
};
