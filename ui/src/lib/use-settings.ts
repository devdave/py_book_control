import { map, Dictionary } from 'lodash'
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useImmer } from 'use-immer'

type GenericTypes<TContainer> = TContainer[keyof TContainer]

export interface ApplicationSetting<TValues extends object = Record<string, unknown>> {
    name: keyof TValues
    value: TValues[keyof TValues]
    type: 'string' | 'boolean' | 'number' | 'undefined'
}

export interface SettingsManagerReturn<TValues extends object = Record<string, unknown>> {
    get: <Field extends keyof TValues>(name: Field) => UseQueryResult<TValues[Field]> | undefined
    set: <Field extends keyof TValues>(name: Field, value: TValues[Field]) => TValues[Field]
    reconcile: (onValuesLoaded: (values: ApplicationSetting<TValues>[]) => void) => void
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
    bulkFetchSettings: () => Promise<ApplicationSetting<TValues>[]>
    setter: UseMutationResult<undefined, unknown, { name: string; value: string }, unknown>
    getter: (<Field extends keyof TValues>(name: Field) => UseQueryResult<TValues[Field]>) | undefined
    bulkDefaultSetter: (changeset: ApplicationSetting<TValues>[]) => Promise<object>
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
    const reconcile = useCallback(
        (onValuesLoaded: (changeset: ApplicationSetting<TValues>[]) => void) => {
            console.log('Ensuring defaults are set')
            if (!defaultSettings) {
                throw new Error('Somehow missing default settings!  Cannot proceed')
            }

            const changeset: { [key: string]: string | any }[] = []

            // eslint-disable-next-line no-restricted-syntax
            for (const [key, value] of Object.entries(defaultSettings)) {
                changeset.push({
                    name: key,
                    value,
                    type: typeof value
                })
            }

            /**
            const changeset: ApplicationSetting[] = map<TValues, ApplicationSetting>(
                Object.entries(defaultSettings),
                (
                    value: GenericTypes<TValues>,
                    name: keyof TValues
                ): { name: keyof TValues; value: GenericTypes<TValues>; type: string } => {
                    console.log('def', name, value)
                    return {
                        name,
                        value,
                        type: typeof defaultSettings[name] as string
                    }
                }
            )*/
            console.log(`Defaults are ${JSON.stringify(changeset)}`)
            const coerced = changeset as ApplicationSetting<TValues>[]
            bulkDefaultSetter(coerced)
                .then(() => console.log('Defaults set'))
                .catch((reason) => console.error('Defaults failed with', reason))

            if (onValuesLoaded) {
                bulkFetchSettings().then((payload: ApplicationSetting<TValues>[]) => {
                    onValuesLoaded(payload)
                })
            }
        },
        [bulkDefaultSetter, bulkFetchSettings, defaultSettings]
    )

    return { get, set, reconcile, makeState }
}

/**
 * Partial example usage
 *
 */

/**

 // Requires a type interface
interface TestSettings {
    delay: number
    disableSomethingImportant: boolean
    thingName: string
}

const settings = useSettings<TestSettings>({
    getter: (settingName)=>api.fetchSetting(settingName),
    setter: (settingName, settingValue)=>api.setSetting(settingName settingValue),
    defaultSetter: undefined,
    defaultSettings: {
        delay: 123,
        disableSomethingImportant: false,
        thingName: 'igor'
    }
})

 const = onValuesFetched(values:TestSettings) => {
    forEach(values, (name, value)=>{
        // For cases like react query when you don't want to spam the hell
        // out of the backend
        localApi.addToSettingsCache(name, value)
    })
    //For a scenario where the application is waiting to proceed
    setAppSettingAreReady(true)
 }

// call when api bridge is up
settings.reconcile()

const [thingName, thingIsLoading, setThingName] = settings.makeState('thingName')
const [delay, delayIsLoading, setDelay] = settings.makeState('delay')
const [toggle1, toggleIsLoading, setToggle1] = settings.makeState('disableSomethingImportant')

if (thingIsLoading || delayIsLoading || toggleIsLoading) {
    console.log('Stuff is still loading!')
}

console.log('thing is ', thingName)
console.log('delay is', delay)
console.log('toggle1 is', toggle1)

setThingName('Bob')
setDelay(856)
setToggle1(!toggle1)

 */
