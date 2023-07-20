import { map, Dictionary } from 'lodash'
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { useCallback } from 'react'

type GenericTypes<TContainer> = TContainer[keyof TContainer]

export interface SettingsManagerReturn<TValues> {
    get: <Field extends keyof TValues>(name: Field) => UseQueryResult<TValues[Field]> | undefined
    set: <Field extends keyof TValues>(name: Field, value: TValues[Field]) => TValues[Field]
    reconcile: () => void
    makeState: <Field extends keyof TValues>(
        name: Field
    ) => [TValues[Field] | undefined, boolean, (value: TValues[Field]) => void]
}

export function useSettings<TValues extends object = Record<string, unknown>>({
    defaultSettings,
    setter,
    getter,
    bulkFetchSettings,
    bulkDefaultSetter
}: {
    defaultSettings: TValues
    bulkFetchSettings: () => Promise<object>
    setter: UseMutationResult<undefined, unknown, { name: string; value: string }, unknown>
    getter: (<Field extends keyof TValues>(name: Field) => UseQueryResult<TValues[Field]>) | undefined
    bulkDefaultSetter: (changeset: object[]) => Promise<object>
}): SettingsManagerReturn<TValues> {
    /**
     * Internalized getter
     *
     * Eventually a place to use a cached copy versus calling home constantly
     */
    const get = useCallback(
        <Field extends keyof TValues>(name: Field): UseQueryResult<TValues[Field]> | undefined =>
            getter ? getter(name) : undefined,
        [getter]
    )

    /**
     * Set the value of a Setting
     *
     * @param name
     * @param value
     */
    const set = useCallback(
        <Field extends keyof TValues>(name: Field, value: TValues[Field]) => {
            console.log('Would set', name, value)
            if (setter) {
                const coerce_name = name as string
                const coerce_value = value as string
                setter.mutate({ name: coerce_name, value: coerce_value })
            }

            // eslint-disable-next-line no-param-reassign
            return value
        },
        [setter]
    )

    /**
     *
     * Given a property name of TValue, return a useState like array
     *
     * @param name
     * @return [value, isLoading, updater]
     */
    const makeState = useCallback(
        <Field extends keyof TValues>(
            name: Field
        ): [TValues[Field] | undefined, boolean, (new_val: TValues[Field]) => void] => {
            const value = get(name)
            if (value === undefined) {
                throw new Error('Missing getter for makeState')
            }
            return [value.data, value.isLoading, (new_val: TValues[Field]) => set(name, new_val)]
        },
        [get, set]
    )

    /**
     * Must be called before any other member function is used
     *
     */
    const reconcile = useCallback(() => {
        console.log('Ensuring defaults are set')
        const changeset = map(
            defaultSettings as Dictionary<unknown>,
            (
                name: keyof TValues,
                value: GenericTypes<TValues>
            ): { name: keyof TValues; value: GenericTypes<TValues>; type: string } => ({
                name,
                value,
                type: typeof defaultSettings[name] as string
            })
        )
        console.log(`Defaults are ${JSON.stringify(changeset)}`)

        const coerced = changeset as unknown
        bulkDefaultSetter(coerced as Array<object>)
            .then(() => console.log('Defaults set'))
            .catch((reason) => console.error('Defaults failed with', reason))
    }, [bulkDefaultSetter, defaultSettings])

    return { get, set, reconcile, makeState }
}

/**
 * Partial example usage
 *
 */

// interface TestSettings {
//     delay: number
//     disableSomethingImportant: boolean
//     thingName: string
// }
//
// const settings = useSettings<TestSettings>({
//     getter: undefined,
//     setter: undefined,
//     defaultSetter: undefined,
//     defaultSettings: {
//         delay: 123,
//         disableSomethingImportant: false,
//         thingName: 'igor'
//     }
// })
//
// // call when api bridge is up
// settings.reconcile()
//
// const [thingName, thingIsLoading, setThingName] = settings.makeState('thingName')
// const [delay, delayIsLoading, setDelay] = settings.makeState('delay')
// const [toggle1, toggleIsLoading, setToggle1] = settings.makeState('disableSomethingImportant')
//
// if (thingIsLoading || delayIsLoading || toggleIsLoading) {
//     console.log('Stuff is still loading!')
// }
//
// console.log('thing is ', thingName)
// console.log('delay is', delay)
// console.log('toggle1 is', toggle1)
//
// setThingName('Bob')
// setDelay(856)
// setToggle1(!toggle1)
