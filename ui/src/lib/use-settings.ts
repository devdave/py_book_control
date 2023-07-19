import { map, Dictionary } from 'lodash'
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { useCallback } from 'react'

export interface SettingsManagerReturn<TValues> {
    get: <Name extends keyof TValues>(name: Name) => UseQueryResult<TValues[Name]> | undefined
    set: <Name extends keyof TValues>(name: Name, value: TValues[Name]) => TValues[Name]
    reconcile: () => void
    makeState: <Name extends keyof TValues>(
        name: Name
    ) => [TValues[Name] | undefined, boolean, (value: TValues[Name]) => void]
}

export function useSettings<TValues extends object = Record<string, unknown>>({
    defaultSettings,
    setter,
    getter,
    bulkFetchSettings,
    bulkDefaultSetter,
    defaultSetter
}: {
    defaultSettings: TValues
    bulkFetchSettings: () => Promise<object>
    setter: UseMutationResult<undefined, unknown, { name: string; value: string }, unknown>
    getter: (<GK extends keyof TValues>(name: GK) => UseQueryResult<TValues[GK]>) | undefined
    bulkDefaultSetter: (changeset: object[]) => Promise<object>
    defaultSetter: (
        name: keyof TValues,
        new_value: TValues[keyof TValues],
        name_type: string
    ) => void | undefined
}): SettingsManagerReturn<TValues> {
    const get = useCallback(
        <K extends keyof TValues>(name: K): UseQueryResult<TValues[K]> | undefined =>
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
        <DefaultName extends keyof TValues>(name: DefaultName, value: TValues[DefaultName]) => {
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
        <K extends keyof TValues>(
            name: K
        ): [TValues[K] | undefined, boolean, (new_val: TValues[K]) => void] => {
            const value = get(name)
            if (value === undefined) {
                throw new Error('Missing getter for makeState')
            }
            return [value.data, value.isLoading, (new_val: TValues[K]) => set(name, new_val)]
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
                value: TValues[keyof TValues],
                name: keyof TValues
            ): { name: keyof TValues; value: TValues[keyof TValues]; type: string } => ({
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

        console.log('Would get current values')
        bulkFetchSettings().then()
    }, [bulkDefaultSetter, bulkFetchSettings, defaultSettings])

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
