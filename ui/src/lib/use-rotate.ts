import { useCallback, useState } from 'react'
import { indexOf } from 'lodash'

interface useRotateOptions {
    nextOption: (val?: string) => void
    prevOption: () => void
}

type useRotateReturn = [string, useRotateOptions]

export const useRotate = (options: string[]): useRotateReturn => {
    if (!options || options.length <= 1) {
        throw new Error('Expected at least two options')
    }
    const [value, setValue] = useState(options[0])

    const nextOption = useCallback(
        (optional: string | undefined = undefined) => {
            console.log(`useRotate.nextOption ${optional}`)
            if (optional) {
                console.log(`Got ${optional}`)
                const index = indexOf(options, optional)
                if (index >= 0) {
                    setValue(() => options[index])
                    console.log(`Set ${options[index]}`)
                    return
                }
                throw new Error(`${optional} is not in ${JSON.stringify(options)}`)
            }

            const current_index = indexOf(options, value)
            if (current_index + 1 >= options.length) {
                setValue(() => options[0])
            } else {
                setValue(() => options[current_index + 1])
            }
        },
        [options, value]
    )

    const prevOption = useCallback(() => {
        const current_index = indexOf(options, value)

        if (current_index - 1 >= 0) {
            setValue(() => options[current_index - 1])
        } else {
            setValue(() => options[options.length - 1])
        }
    }, [options, value])

    return [value, { nextOption, prevOption }]
}
