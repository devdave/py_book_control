import { modals } from '@mantine/modals'
import { Button, Group, TextInput } from '@mantine/core'
import React from 'react'
import { GenerateRandomString } from '../lib/utils'

export class InputModal {
    modalId: string

    constructor() {
        this.modalId = GenerateRandomString(12)
    }

    killModal() {
        modals.close(this.modalId)
    }

    static Show(prompt: string) {
        return new InputModal().arun(prompt)
    }

    async arun(prompt: string): Promise<string> {
        return new Promise((resolve) => {
            let textValue = ''
            const sendInput = () => {
                modals.close(this.modalId)
                console.info(`Send ${textValue}`)
                resolve(textValue)
            }

            const handleClick = () => {
                sendInput()
            }

            const detectEnter = (evt: React.KeyboardEvent<HTMLInputElement>) => {
                if (evt.key === 'Enter') {
                    console.info('Enter caught')
                    evt.preventDefault()
                    sendInput()
                }
            }

            modals.open({
                modalId: this.modalId,
                title: prompt,
                withinPortal: false,
                centered: true,
                children: (
                    <Group position='center'>
                        <TextInput
                            placeholder={prompt}
                            data-autofocus
                            onChange={(evt) => {
                                textValue = evt.currentTarget.value
                            }}
                            onKeyDown={detectEnter}
                        />
                        <Button onClick={handleClick}>Create</Button>
                        <Button onClick={this.killModal.bind(this)}>Cancel</Button>
                    </Group>
                )
            })
        })
    }
}
