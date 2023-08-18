import { useState } from 'react'
import { readDataTransferFromClipboard } from '@testing-library/user-event/utils/dataTransfer/Clipboard'
import axios from 'axios'

export interface ChatBrokerFunctions {
    setAPI: (token: string) => void
    summarize: (content: string) => Promise<object>
}

export const ChatBroker = (baseURL: string): ChatBrokerFunctions => {
    const service = axios.create({
        headers: { 'Access-Control-Allow-Origin': '*' },
        baseURL
    })

    const [api, setAPI] = useState('')

    const summarize = async (content: string) =>
        service.post('/summarize', {
            name: 'Summarize',
            token: api,
            body: content
        })

    return {
        setAPI,
        summarize
    }
}
