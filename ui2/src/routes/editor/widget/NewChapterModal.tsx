import { modals } from '@mantine/modals'
import {Button, Radio, Space, TextInput} from '@mantine/core'
import { KeyboardEventHandler } from 'react'

export function NewChapterModal() {
    return new Promise<[string | undefined, string]>((resolve) => {
        let chapterName = ''
        let chapterMode = "prepend"

        const doSubmit = () => {
            modals.close('newChapterModal')
            resolve([chapterName, chapterMode])
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
            modalId: 'newChapterModal',
            title: 'New chapter name.',
            children: (
                <>
                    <TextInput
                        label='Chapter name'
                        onChange={(evt) => {
                            chapterName = evt.currentTarget.value
                        }}
                        onKeyUp={listen4Enter}
                        placeholder='Provide a new chapter name'
                        description='Must be atleast 3 characters or longer.'
                        data-autofocus
                        withAsterisk
                    />
                    <Radio.Group name={"chapterMode"} label={"Where to put new chapter?"} onChange={(val)=>{chapterMode=val}}>
                        <Radio value={"append"} label={"Append"}/>
                        <Radio value={"prepend"} label={"Prepend"}/>
                    </Radio.Group>

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
