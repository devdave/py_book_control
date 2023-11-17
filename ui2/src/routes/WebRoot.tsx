

import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useCallback, useEffect, useState, useMemo} from "react";


import {Main} from "@src/routes/main/Main.tsx";
import {font_set} from "@src/lib/font_set.ts";
import Boundary from "@src/lib/boundary.ts"
import APIBridge from "@src/lib/remote.ts";
import {Switchboard} from "@src/lib/switchboard.ts"
import {ApplicationSetting, useSettings} from "@src/lib/use-settings.ts";
import {AppSettingValues} from "@src/types.ts";
import { AppContext, AppContextValue } from '@src/App.context'
import {BookBroker} from "@src/brokers/BookBroker.ts";
import {SceneStatusBroker} from "@src/brokers/SceneStatusBroker.ts";
import {ChatBroker} from "@src/brokers/ChatBroker.ts";


const RootRouter = () => {
  return (
        <Router>
            <h1>Hello world!</h1>
            <Routes>
                <Route path="/" element={<Main/>}/>
            </Routes>
        </Router>
    )
}

export const WebRoot = () => {
    const queryClient = useQueryClient()

    const [fonts, setFonts] = useState<Set<string>>(new Set())

    const boundary = useMemo(() => new Boundary(), [])

    const api = useMemo(() => new APIBridge(boundary), [boundary])

    const switchBoard = useMemo(() => new Switchboard(), [])


    /**
     * Brokers
     */
    const bookBroker = BookBroker({ api, queryClient })

    const sceneStatusBroker = SceneStatusBroker({ api, queryClient })

    const chatBroker = ChatBroker('http://127.0.0.1:8000/')


    /**
     * Application settings
     *
     */
    const settingsSetter = useMutation(
        {
        mutationFn: ({ name, value }) => api.setSetting(name, value),
        onSuccess: (_data: undefined, { name, value }: { name: string; value: string }) => {
            console.log(`Updated setting.${name} with ${value}`)
            queryClient.setQueryData(['setting', name], () => value)

            queryClient
                .invalidateQueries({
                    queryKey: ['settings'],
                    exact: true,
                    refetchType: 'active'
                })
                .then()
        }
    })

    const fetchSetting = (name: string) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: ['setting', name],
            queryFn: () => api.getSetting(name)
        })

    const bulkDefaultSetter = (changeset: object[]): Promise<object> => api.bulkDefaultSettings(changeset)

    const bulkFetchSettings = (): Promise<ApplicationSetting[]> => api.fetchAllSettings()

    // const reconcileSettings = useCallback(
    //     (values: ApplicationSetting[]) => {
    //         console.log(`Got bulk settings ${JSON.stringify(values)}`)
    //         forEach(values, (setting) => {
    //             queryClient.setQueryData(['setting', setting.name], () => setting.value)
    //         })
    //     },
    //     [queryClient]
    // )

    const settings = useSettings<AppSettingValues>({
        bulkFetchSettings,
        bulkDefaultSetter,
        getter: fetchSetting,
        setter: settingsSetter,
        defaultSettings: {
            fontName: 'Calibri',
            lineHeight: 150,
            fontSize: 18,
            fontWeight: 400,
            debounceTime: 800,
            dontAskOnSplit: false,
            dontAskOnClear2Delete: false,
            defaultSceneStatus: '-1',
            lastImportedPath: ''
        }
    })


    /**
     * FONT STUFF
     */
    const checkFonts = useCallback(() => {
        const fontAvailable = new Set<string>()

        // eslint-disable-next-line no-restricted-syntax
        for (const font of font_set.values()) {
            if (document.fonts.check(`12px "${font}"`)) {
                fontAvailable.add(font)
            }
        }
        console.log("I found ", fontAvailable)
        setFonts(fontAvailable)
    }, [])

    useEffect(() => {
        document.fonts.ready.then(() => {
            checkFonts()

        })
    }, [])

    /**
     * Finalization
     *
     */
    const appContextValue = useMemo<AppContextValue>(
        () => ({
            api,
            settings,
            switchBoard,
            fonts,
            bookBroker,
            sceneStatusBroker,
            chatBroker
        }),
        [
            api,
            settings,
            switchBoard,
            fonts,
            bookBroker,
            sceneStatusBroker,
            chatBroker
        ]
    )




    

    return (
        <>
            <AppContext.Provider value={appContextValue}>
                <RootRouter/>
            </AppContext.Provider>
        </>
    )

}


