import { modals } from '@mantine/modals'
import {Button, Space, TextInput} from '@mantine/core'
import { KeyboardEventHandler } from 'react'

export function NewSceneModal() {
    return new Promise<string>((resolve) => {
        let sceneName = ''


        const doSubmit = () => {
            modals.close('newSceneModal')
            resolve(sceneName)
        }

        const listen4Enter: KeyboardEventHandler<HTMLInputElement> = (evt) => {
            if (evt.key === 'Enter') {
                evt.preventDefault()
                doSubmit()
            }
        }

        const handleSubmitClick = () => {
            doSubmit()
        }

        modals.open({
            modalId: 'newSceneModal',
            title: 'New scene name',
            children: (
                <>
                    <TextInput
                        label='Scene name'
                        onChange={(evt) => {
                            sceneName = evt.currentTarget.value
                        }}
                        onKeyUp={listen4Enter}
                        placeholder='Provide a new scene name'
                        description='Must be atleast 3 characters or longer.'
                        data-autofocus
                        withAsterisk
                    />

                    <Button
                        fullWidth
                        onClick={handleSubmitClick}
                    >
                        Submit
                    </Button>
                    <Space h="xl"/>
                </>
            )
        })
    })
}
