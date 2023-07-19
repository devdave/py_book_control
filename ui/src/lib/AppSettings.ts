import APIBridge from '@src/lib/remote'
import { QueryClient, useMutation, UseMutationResult, useQuery } from '@tanstack/react-query'
import { AppSettingName } from '@src/types'
import { boolean } from 'zod'

type ValidSettingType = string | number | boolean
type ValidSettingTypeNames = 'string' | 'number' | 'boolean'

export class AppSettings<TNames> {
    api: APIBridge
    queryClient: QueryClient
    _set: UseMutationResult<[TNames, string | number, string], Error> | undefined
    _default: UseMutationResult<[TNames, string | number, string], Error> | undefined

    constructor(api: APIBridge, queryClient: QueryClient) {
        this.api = api
        this.queryClient = queryClient
        this._set = undefined
        this._default = undefined
    }

    public set assignDefaultSetter(mutator: UseMutationResult<[TNames, string | number, string], Error>) {
        this._default = mutator
    }

    public set assignSetter(mutator: UseMutationResult<[TNames, string | number, string], Error>) {
        this._set = mutator
    }

    public set(name: TNames, value: ValidSettingType) {
        this._set!.mutate([name, value])
    }

    public setString(name: TNames, value: string) {
        return this.set(name, value)
    }

    public setNumber(name: TNames, value: number) {
        return this.set(name, value)
    }

    public setBoolean(name: TNames, value: boolean) {
        return this.set(name, value)
    }

    public get(name: TNames) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useQuery({
            queryKey: ['setting', name],
            queryFn: () => this.api.getSetting(name)
        })
    }

    public all() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useQuery({
            queryKey: ['settings'],
            queryFn: () => this.api.fetchAllSettings()
        })
    }

    public default(name: TNames, val: ValidSettingType, type: ValidSettingTypeNames) {
        return this._default?.mutate([name, val, type])
    }

    public defaultNumber(name: TNames, val: number) {
        return this.default(name, val, 'number')
    }

    public defaultString(name: TNames, val: string) {
        return this.default(name, val, 'string')
    }

    public defaultBool(name: TNames, val: boolean) {
        return this.default(name, val, 'boolean')
    }

    public addState<TType extends ValidSettingType>(name: TNames, defval: ValidSettingType): void {
        let typename: ValidSettingTypeNames = 'string'
        switch (typeof defval) {
            case 'boolean':
                this.defaultBool(name, defval as boolean)
                typename = 'boolean'
                break
            case 'number':
                this.defaultNumber(name, defval as number)
                typename = 'number'
                break
            case 'string':
                this.defaultString(name, defval as string)
                typename = 'string'
                break
        }
    }
    public state<TType extends ValidSettingType>(name: TNames): [TType, (val: TType) => void] {
        return [this.get(name).data, (val: TType) => this.set(name, val)]
    }
}
