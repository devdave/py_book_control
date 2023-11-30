import { modals } from '@mantine/modals'
import {Button, Space, TextInput} from '@mantine/core'
import { KeyboardEventHandler } from 'react'

export function BookNameModal() {
    return new Promise<string | undefined>((resolve) => {
        let bookName = ''

        const doSubmit = () => {
            modals.close('newBookModal')
            resolve(bookName)
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
            modalId: 'newBookModal',
            title: 'New book name.',
            children: (
                <>
                    <TextInput
                        label='Book name'
                        onChange={(evt) => {
                            bookName = evt.currentTarget.value
                        }}
                        onKeyUp={listen4Enter}
                        placeholder='Provide a new book name'
                        description='The name of your bool, must be atleast 3 characters or longer.'
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
