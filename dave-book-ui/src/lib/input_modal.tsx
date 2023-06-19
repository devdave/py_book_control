import {modals} from "@mantine/modals";
import {Button, Group, TextInput} from "@mantine/core";
import React from "react";
import {GenerateRandomString} from "./utils";

type Callback<Type> = (arg: Type) => void;

export const PromptModal = (promptText:string):Promise<string> => {

    return new Promise<string>((resolve) => {
        let textValue = "";

        const modalId = GenerateRandomString(12);

        const killModal = () => {
            modals.close(modalId);
            resolve(textValue);
        }

        const sendInput = () => {
            modals.close(modalId);
            console.info(`Send ${textValue}`);
            resolve(textValue);
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
            modalId: modalId,
            title: promptText,
            withinPortal: false,
            centered: true,
            children: (
                <Group position="center" onBlur={killModal}>
                    <TextInput
                        placeholder={promptText}
                        data-autofocus
                        onChange={(evt) => textValue = evt.currentTarget.value}
                        onKeyDown={detectEnter}
                    />
                    <Button onClick={handleClick}>Create</Button>
                    <Button onClick={killModal}>Cancel</Button>
                </Group>
            ),
        });

    });
}

class InputModal {

    modalId: string

    constructor() {
        this.modalId = GenerateRandomString(12);
    }

    killModal() {
        modals.close(this.modalId);
    }

    async arun(prompt: string) {
        return new Promise((resolve) => {

            let textValue = "";
            const sendInput = () => {
                modals.close(this.modalId);
                console.info(`Send ${textValue}`);
                resolve(textValue);
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
                title: prompt,
                withinPortal: false,
                centered: true,
                children: (
                    <Group position="center">
                        <TextInput
                            placeholder={prompt}
                            data-autofocus
                            onChange={(evt) => textValue = evt.currentTarget.value}
                            onKeyDown={detectEnter}
                        />
                        <Button onClick={handleClick}>Create</Button>
                        <Button onClick={this.killModal.bind(this)}>Cancel</Button>
                    </Group>
                ),
            });
        });
    }

    run(callback: Callback<string>, prompt: string) {

        let textValue = "";


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
            title: prompt,
            withinPortal: false,
            centered: true,
            children: (
                <Group position="center">
                    <TextInput
                        placeholder={prompt}
                        data-autofocus
                        onChange={(evt) => textValue = evt.currentTarget.value}
                        onKeyDown={detectEnter}
                    />
                    <Button onClick={handleClick}>Create</Button>
                    <Button onClick={this.killModal.bind(this)}>Cancel</Button>
                </Group>
            ),
        });
    }

}

export default InputModal;