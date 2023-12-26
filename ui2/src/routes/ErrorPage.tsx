import {ErrorResponse, Link, useRouteError} from "react-router-dom";
import { Group } from "@mantine/core";

export const ErrorPage = () => {
    const error: unknown = useRouteError() as ErrorResponse;
    console.error((error as Error)?.message ||
            (error as { statusText?: string })?.statusText);

    return (
        <Group>
            <h1>Oops</h1>
            <div>
                <p>Sorry but I've jumped the train tracks somehow</p>
            </div>
            <p>
                <i>
                    {(error as Error)?.message ||
            (error as { statusText?: string })?.statusText}
                </i>
                <br />
            </p>
            <div>Location: {window.location.href}</div>
            <p><Link to={"/"}>Back to start</Link></p>
        </Group>
    );
};
