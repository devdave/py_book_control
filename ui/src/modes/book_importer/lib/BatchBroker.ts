import APIBridge from '@src/lib/remote'
import { QueryClient, useQuery, UseQueryResult } from '@tanstack/react-query'
import { BatchSettings } from '@src/modes/book_importer/types'

interface BatchBrokerProps {
    api: APIBridge
    queryClient: QueryClient
}

export interface BatchBrokerReturns {
    fetch: () => UseQueryResult<BatchSettings>
    set: (
        key: keyof BatchSettings,
        value: number | string | Record<string, string | number | boolean>
    ) => Promise<void>
}

export const BatchBroker = ({ api, queryClient }: BatchBrokerProps): BatchBrokerReturns => {
    const fetch = () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery<BatchSettings>({
            queryFn: () => api.importer_start_batch(),
            queryKey: ['batch']
        })

    const set = async (key: keyof BatchSettings, value: any) => {
        await api.importer_add2_batch(key, value)
        await queryClient.invalidateQueries({
            queryKey: ['batch'],
            refetchType: 'active'
        })
    }

    return {
        fetch,
        set
    }
}
