import {modals} from "@mantine/modals";
import {Button, Group, TextInput} from "@mantine/core";
import React from "react";
import {GenerateRandomString} from "./utils.ts";

type Callback<Type> = (arg:Type) => void;

export class InputModal {

    modalId: string
    constructor() {

        this.modalId = GenerateRandomString(12);
    }

    run(callback:Callback<string>) {

        let textValue = "";
        const killModal = () => {
            modals.close(this.modalId);
        }

        const sendInput = () => {
            modals.close(this.modalId);
            console.info(`Send ${textValue}`);
            callback(textValue);
        }

        const handleClick = () => {
            sendInput();
        }

        const detectEnter = (evt: React.KeyboardEvent<HTMLInputElement>) => {
            if (evt.key === "Enter") {
                console.info("Enter caught");
                evt.preventDefault();
                sendInput();
            }
        }

        modals.open({
            modalId: this.modalId,
            title: "Create a new chapter",
            withinPortal: false,
            centered: true,
            children: (
                <Group position="center">
                    <TextInput
                        name="chapterName"
                        placeholder="New chapter name"
                        data-autofocus
                        onChange={(evt) => textValue = evt.currentTarget.value}
                        onKeyDown={detectEnter}
                    />
                    <Button onClick={handleClick}>Create</Button>
                    <Button onClick={killModal}>Cancel</Button>
                </Group>
            ),
        });
    }

}
