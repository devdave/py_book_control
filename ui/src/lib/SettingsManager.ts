import { forEach } from 'lodash'
import { UseQueryResult } from '@tanstack/react-query'
import { useCallback } from 'react'

export type LooseKeys<Values> = keyof Values | (string & object)

export interface SettingsManagerReturn<TValues> {
    get: <Name extends keyof TValues>(name: Name) => UseQueryResult<TValues[Name]> | undefined
    set: <Name extends keyof TValues>(name: Name, value: TValues[Name]) => TValues[Name]
    reconcile: () => void
    makeState: <Name extends keyof TValues>(
        name: Name
    ) => [TValues[Name] | undefined, boolean, (value: TValues[Name]) => void]
}

interface TestSettings {
    delay: number
    disableSomethingImportant: boolean
    thingName: string
}

export function SettingsManager<TValues extends object = Record<string, unknown>>({
    defaultSettings,
    setter,
    getter,
    defaultSetter
}: {
    defaultSettings: TValues
    setter:
        | (<GK extends keyof TValues>(
              name: GK,
              new_value: GK extends keyof TValues ? TValues[GK] : unknown
          ) => void)
        | undefined
    getter: (<GK extends keyof TValues>(name: GK) => UseQueryResult<TValues[GK]>) | undefined
    defaultSetter:
        | (<GK extends keyof TValues>(
              name: GK,
              new_value: GK extends keyof TValues ? TValues[GK] : unknown,
              name_type: string
          ) => void)
        | undefined
}): SettingsManagerReturn<TValues> {
    function get<K extends keyof TValues>(name: K): UseQueryResult<TValues[K]> | undefined {
        if (getter) {
            return getter(name)
        }
        return undefined
    }

    /**
     * Set the value of a Setting
     *
     * @param name
     * @param value
     */
    function set<DefaultName extends keyof TValues>(name: DefaultName, value: TValues[DefaultName]) {
        console.log('Would set', name, value)
        if (setter) {
            setter(name, value)
        }

        // eslint-disable-next-line no-param-reassign
        defaultSettings[name] = value
        return value
    }

    /**
     *
     * Given a property name of TValue, return a useState like array
     *
     * @param name
     * @return [value, isLoading, updater]
     */
    function makeState<K extends keyof TValues>(
        name: K
    ): [TValues[K] | undefined, boolean, (new_val: TValues[K]) => void] {
        const value = get(name)
        if (value === undefined) {
            throw new Error('Missing getter for makeState')
        }
        return [value.data, value.isLoading, (new_val: TValues[K]) => set(name, new_val)]
    }

    /**
     * Must be called before any other member function is used
     *
     */
    function reconcile() {
        forEach(defaultSettings, (name, value: string | boolean | number) => {
            console.log('Would do default', name, value, typeof defaultSettings[name])
            if (defaultSetter) {
                defaultSetter(name, value as TValues[keyof TValues], typeof defaultSettings[name])
            }
            console.log('Would get current value')
        })
    }

    return { get, set, reconcile, makeState }
}

const settings = SettingsManager<TestSettings>({
    getter: undefined,
    setter: undefined,
    defaultSetter: undefined,
    defaultSettings: {
        delay: 123,
        disableSomethingImportant: false,
        thingName: 'igor'
    }
})

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
