import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import Boundary, { PYWEBVIEWREADY } from "@src/lib/boundary.ts";
import APIBridge from "@src/lib/remote.ts";
import { Switchboard } from "@src/lib/switchboard.ts";
import { BookBroker } from "@src/brokers/BookBroker.ts";
import { SceneStatusBroker } from "@src/brokers/SceneStatusBroker.ts";
import { ChatBroker } from "@src/brokers/ChatBroker.ts";
import { ApplicationSetting, useSettings } from "@src/lib/use-settings.ts";
import { AppSettingValues } from "@src/types.ts";
import { font_set } from "@src/lib/font_set.ts";
import { AppContext, AppContextValue } from "@src/App.context.ts";
import { ThemeProvider } from "@src/ThemeProvider.tsx";
import { WebRoot } from "@src/routes/WebRoot.tsx";
import { LoadingOverlay } from "@mantine/core";
import { forEach } from "lodash";
import {ChapterBroker} from "@src/brokers/ChapterBroker.ts";
import {CharacterBroker} from "@src/brokers/CharacterBroker.ts";
import {SceneBroker} from "@src/brokers/SceneBroker.ts";

let appIsReady = false;

export const App = () => {
    const queryClient = useQueryClient();

    const [fonts, setFonts] = useState<Set<string>>(new Set());

    const [defaultsDone, setDefaultsDone] = useState(false);

    const boundary = useMemo(() => new Boundary(), []);

    const api = useMemo(() => new APIBridge(boundary), [boundary]);

    const switchBoard = useMemo(() => new Switchboard(), []);

    const [viewMode, setViewMode] = useState("flow")

    /**
   * Brokers
   */
    const bookBroker = BookBroker({ api, queryClient });

    const sceneStatusBroker = SceneStatusBroker({ api, queryClient });

    const chatBroker = ChatBroker("http://127.0.0.1:8000/");

    const chapterBroker = ChapterBroker({api, queryClient})

    const sceneBroker = SceneBroker({api, queryClient})

    const characterBroker = CharacterBroker({api, queryClient})

    /**
   * Application settings
   *
   */
    const settingsSetter = useMutation({
        mutationFn: ({ name, value }) => api.setSetting(name, value),
        onSuccess: (
            _data: undefined,
            { name, value }: { name: string; value: string },
        ) => {
            console.log(`Updated setting.${name} with ${value}`);
            queryClient.setQueryData(["setting", name], () => value);

            queryClient
                .invalidateQueries({
                    queryKey: ["settings"],
                    exact: true,
                    refetchType: "active",
                })
                .then();
        },
    });

    const fetchSetting = (name: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: ["setting", name],
            queryFn: () => api.getSetting(name),
        });

    const reconcileSettings = useCallback(
        (values: ApplicationSetting[]) => {
            console.log(`Got bulk settings ${JSON.stringify(values)}`);
            forEach(values, (setting) => {
                queryClient.setQueryData(
                    ["setting", setting.name],
                    () => setting.value,
                );
            });
        },
        [queryClient],
    );

    const bulkDefaultSetter = (changeset: object[]): Promise<object> =>
        api.bulkDefaultSettings(changeset);

    const bulkFetchSettings = (): Promise<ApplicationSetting[]> =>
        api.fetchAllSettings();

    const settings = useSettings<AppSettingValues>({
        bulkFetchSettings,
        bulkDefaultSetter,
        getter: fetchSetting,
        setter: settingsSetter,
        defaultSettings: {
            fontName: "Calibri",
            lineHeight: 150,
            fontSize: 18,
            fontWeight: 400,
            debounceTime: 800,
            dontAskOnSplit: false,
            dontAskOnClear2Delete: false,
            defaultSceneStatus: "-1",
            lastImportedPath: "",
        },
    });

    /**
   * FONT STUFF
   */
    const checkFonts = useCallback(() => {
        const fontAvailable = new Set<string>();

        // eslint-disable-next-line no-restricted-syntax
        for (const font of font_set.values()) {
            if (document.fonts.check(`12px "${font}"`)) {
                fontAvailable.add(font);
            }
        }

        setFonts(fontAvailable);
    }, []);

    useEffect(() => {
        document.fonts.ready.then(() => {
            checkFonts();
        });
    }, [checkFonts]);

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
            characterBroker,
            chapterBroker,
            sceneBroker,
            sceneStatusBroker,
            chatBroker,
            viewMode,
            setViewMode
        }),
        [api, settings, switchBoard, fonts, bookBroker, characterBroker, chapterBroker, sceneBroker, sceneStatusBroker, chatBroker, viewMode],
    );

    console.log("Appcontext: ", appContextValue);

    /**
   * Finalization
   *
   */

    const doReady = useCallback(async () => {
        if (!defaultsDone) {
            settings.reconcile(reconcileSettings);
            setDefaultsDone(true);
        }
        appIsReady = true;
    }, [defaultsDone, settings, reconcileSettings, api]);

    useEffect(() => {
        if (window.pywebview !== undefined && window.pywebview.api !== undefined) {
            doReady().then();
        } else {
            window.addEventListener(PYWEBVIEWREADY, doReady, { once: true });
        }
    }, [doReady]);

    if (!appIsReady) {
        return (
            <AppContext.Provider value={appContextValue}>
                <ThemeProvider>
                    <LoadingOverlay />
                </ThemeProvider>
            </AppContext.Provider>
        );
    }

    return (
        <>
            <AppContext.Provider value={appContextValue}>
                <ThemeProvider>
                    <WebRoot />
                </ThemeProvider>
            </AppContext.Provider>
        </>
    );
};
