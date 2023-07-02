import {
    AppShell,
    Box,
    createStyles,
    Group,
    Header,
    LoadingOverlay,
    Switch,
    Title,
    useMantineColorScheme
} from '@mantine/core'
import {IconMoonStars, IconSun} from '@tabler/icons-react'
import {clone, find, forEach, map} from 'lodash'

import {useCallback, useEffect, useMemo, useState} from 'react'

import {PromptModal} from "./lib/input_modal";

import {BookContext} from './Book.context'
import {LeftPanel} from './LeftPanel'
import {RightPanel} from './editor_panel';
import {ContinuousBody} from './continuous_panel';

import {type Chapter, type Scene, SplitResponse, ViewModes} from './types'
import APIBridge from "./lib/remote";


const useStyles = createStyles((theme) => ({
    main: {
        backgroundColor: theme.colorScheme === 'light' ? theme.colors.gray[0] : theme.colors.dark[6]
    }
}))

interface BookProps {
    api: APIBridge
    bookId: string | undefined
    bookTitle: string | undefined
}

export const Book: React.FC<BookProps> = ({api, bookId, bookTitle}) => {

    const {classes, theme} = useStyles()
    const {colorScheme, toggleColorScheme} = useMantineColorScheme()
    const [fetchedBook, setFetchedBook] = useState(false);
    const [chapters, _setChapters] = useState<Chapter[]>([]);
    const [activeChapter, _setActiveChapter] = useState<Chapter | undefined>(undefined);
    const [activeScene, _setActiveScene] = useState<Scene | undefined>(undefined);
    const [viewMode, setViewMode] = useState<ViewModes>(ViewModes.LIST);



    const addChapter = useCallback(
        async () => {

            const chapterTitle: string = await PromptModal("New chapter title");
            if (chapterTitle.trim().length <= 2) {
                alert("Chapter's must have a title longer than 2 characters.");
                return;
            }
            const newChapter = await api.create_chapter(chapterTitle);


            _setChapters((prevChapters) => {
                // const chapter = createChapter(chapterTitle, chapterId, chapters.length + 1)

                // const scene = createScene(chapter.id)

                // chapter.scenes.push(scene)

                _setActiveChapter(newChapter)
                if (newChapter.scenes.length > 0) {
                    _setActiveScene(newChapter.scenes[0]);
                }

                return [...prevChapters, newChapter]
            });
        },
        []
    )

    const createScene = useCallback(
        async (chapterId: string, sceneTitle: string, position = -1, content = '') => {


            const newScene = await api.create_scene(chapterId, sceneTitle);
            newScene.content = content;
            if (position >= 0) {
                newScene.order = position;
            }

            _setChapters((prevChapters) =>
                map(prevChapters, (chapter) => {
                    if (chapter.id === chapterId) {

                        let scenes = clone(chapter.scenes);
                        if(position >= 0){
                            scenes.splice(position, 0, newScene);
                            scenes = scenes.map((element, idx)=>{
                                element.order = idx;
                                return element;
                            });
                        } else {
                            scenes.push(newScene);
                        }
                        chapter.scenes = scenes;

                        _setActiveChapter(chapter)
                        _setActiveScene(newScene)

                        return chapter
                    }

                    return chapter
                })
            );
            return newScene;
        }, []);

    const addScene = useCallback(
        async (chapterId: string | undefined): Promise<void | Scene> => {

            if (chapterId === undefined) {
                console.log("Tried to add a scene when there isn't an activeChapter");
                await api.alert("There was a problem creating a new scene!");
                return;
            }


            console.log("addScene chapter.id=", chapterId);

            const sceneTitle: string = await PromptModal("New scene title");
            if (sceneTitle.trim().length <= 2) {
                alert("A scene must have a title longer than 2 characters.");
                return;
            }
            return await createScene(chapterId, sceneTitle);

        },
        []
    );


    const getChapter = useCallback((chapterId: string) => find(chapters, ['id', chapterId]), [chapters])

    const getStrippedChapters = useCallback(async () => {
        const fetchedData: Chapter[] = await api.fetch_stripped_chapters();
        return fetchedData;
    }, [bookId]);

    const reorderChapter = useCallback(
        async (from: number, to: number) => {
            _setChapters((prevChapters) => {
                // make a clone of the chapters array, so we don't mutate it in place
                const nextChapters = clone(prevChapters)

                // reorder the chapter array
                nextChapters.splice(to, 0, nextChapters.splice(from, 1)[0])

                // iterate over each item and overwrite its new sequence
                return map(nextChapters, (chapter, chapterIdx) => ({
                    ...chapter,
                    order: chapterIdx
                }))
            });

            const response = await api.save_reordered_chapters(chapters);

        },
        []
    )
    const reorderScene = useCallback(
        (chapterId: string, from: number, to: number) => {

            _setChapters((prevChapters) =>
                map(prevChapters, (chapter) => {
                    if (chapter.id === chapterId) {
                        // make a clone of the scenes array, so we don't mutate it in place
                        console.log("Pre reorder", chapter.scenes);
                        const nextScenes = clone(chapter.scenes)
                        const targetScene = nextScenes.splice(from, 1)[0];
                        nextScenes.splice(to, 0, targetScene);

                        _setActiveScene((prevState) => targetScene);
                        const sortedScenes = nextScenes.map((old_scene, sidx) => {
                            old_scene.order = sidx;
                            return old_scene;
                        });


                        const nextChapter: Chapter = {
                            ...chapter,
                            updated_on: new Date(Date.now()).toUTCString(),
                            scenes: sortedScenes
                        }

                        api.reorder_scenes(sortedScenes).then();

                        console.log("post reorder", sortedScenes);

                        return nextChapter
                    }

                    return chapter
                })
            );

        },
        []
    )


    const setActiveChapter = useCallback(async (chapter: Chapter) => {
        if (activeChapter !== undefined) {
            activeChapter.notes = "";
            activeChapter.summary = "";
            forEach(activeChapter.scenes, (scene) => {
                scene.notes = "";
                scene.content = "";
                scene.summary = "";
            })
        }
        const changeScene = activeScene !== undefined && activeChapter !== undefined && activeScene.chapterId === activeChapter.id;

        const newChapters = await api.fetch_stripped_chapters();
        _setChapters(oldchap=>newChapters);

        chapter = await api.fetch_chapter(chapter.id);
        chapter.updated_on = new Date(Date.now()).toUTCString();
        _setActiveChapter(old_chapter=>chapter)

        if(activeScene === undefined || activeScene.chapterId !== chapter.id ){
            _setActiveScene(old_scene => chapter.scenes[0]);
        }

    }, [])

    const setActiveScene = useCallback((chapter: Chapter, scene: Scene) => {
        _setActiveChapter(old_chap=>chapter);
        _setActiveScene(old_scene=>scene);

    }, []);

    const updateChapter = useCallback(
        async (chapter: Chapter) => {

            const authoritiveChapter = await api.update_chapter(chapter.id, chapter);
            authoritiveChapter.updated_on = new Date(Date.now()).toUTCString();

            if (!authoritiveChapter) {
                alert("Warning!  Failed to save chapter changes.");
                return;
            }

            console.log("Would update chapter with ", chapter);
            console.trace();

            _setChapters((prevChapters) =>
                map(prevChapters, (prevChapter) => (prevChapter.id === authoritiveChapter.id ? authoritiveChapter : prevChapter))
            );
            if (activeChapter?.id == chapter.id) {
                _setActiveChapter(authoritiveChapter);
            }
        },

        []);

    const updateScene = useCallback(
        async (scene: Scene) => {
            console.log("updateScene", scene);

            const chapter = getChapter(scene.chapterId);

            console.log("What the fuck: ", scene.id,scene.order, scene.title);
            console.trace();
            const authoritiveScene = await api.update_scene(scene.id, scene);

            authoritiveScene.updated_on = new Date(Date.now()).toUTCString();

            if (!authoritiveScene) {
                alert("Failed to update scene!");
                return;
            }

            if (chapter) {
                await updateChapter({
                    ...chapter,
                    scenes: map(chapter.scenes, (prevScene) => (prevScene.id === authoritiveScene.id ? authoritiveScene : prevScene))
                })
            } else {
                alert("Failed to find chapter.");
            }
        },
        [getChapter, updateChapter]
    );

    const deleteScene = useCallback(
        async (chapterId: string, sceneId: string) => {
            const response = await api.delete_scene(chapterId, sceneId);
            if (response) {
                const new_chap_date = new Date(Date.now()).toUTCString();

                _setChapters((prevState) => {
                    return map(prevState, (prevChapter) => {
                        if (prevChapter.id == chapterId) {
                            prevChapter.updated_on = new Date(Date.now()).toUTCString();
                            prevChapter.scenes = prevChapter.scenes.filter((existing) => existing.id != sceneId);

                        }

                        return prevChapter;
                    })
                });
            } else {
                api.info("Failed to delete scene or got non-positive response!");
            }
        }
        , []);


    const onToggleColorScheme = useCallback(() => toggleColorScheme(), [toggleColorScheme])

    const bookContextValue = useMemo(
        () => ({
            activeChapter,
            activeScene,
            addChapter,
            addScene,
            createScene,
            chapters,
            viewMode,
            api,
            reorderChapter,
            reorderScene,
            setActiveChapter,
            setActiveScene,
            updateChapter,
            updateScene,
            deleteScene,
            setViewMode,
            _setChapters,
            _setActiveChapter,
            _setActiveScene,
        }),
        [
            activeChapter,
            activeScene,
            addChapter,
            addScene,
            chapters,
            reorderChapter,
            reorderScene,
            setActiveChapter,
            setActiveScene,
            updateChapter,
            updateScene,
            setViewMode,
            _setChapters,
            _setActiveChapter,
            _setActiveScene,
        ]
    );

    useEffect(() => {
        const fetchChapters = async () => {
            const fetchedData: Chapter[] = await api.fetch_stripped_chapters();

            _setChapters(fetchedData);
            if (fetchedData.length > 0) {
                fetchedData[0] = await api.fetch_chapter(fetchedData[0].id);
                _setActiveChapter(fetchedData[0])
                if (fetchedData[0].scenes.length > 0) {
                    _setActiveScene(fetchedData[0].scenes[0]);
                }
            }

        }

        fetchChapters().then(() => setFetchedBook(true));


    }, []);

    if (!fetchedBook) {
        return (
            <LoadingOverlay visible={true}/>
        );
    }

    let rightPanel = (
        <h1>No book loaded</h1>
    )

    switch (viewMode) {
        case ViewModes.LIST:
            if (activeChapter !== undefined) {
                rightPanel = (
                    <RightPanel key={`${activeChapter?.id}-${activeScene?.id}`}/>
                )
            } else {
                rightPanel = (
                    <h2>Create a new chapter!</h2>
                )
            }
            break;
        case ViewModes.FLOW:
            if (activeChapter !== undefined) {
                rightPanel = (
                    <ContinuousBody key={`${activeChapter.id} ${activeChapter.updated_on}`}/>
                )
            } else {
                rightPanel = (
                    <h2>Create a new chapter!</h2>
                )
            }


    }

    if (!activeChapter) {
        return (
            <Title order={3}>There is no activeChapter</Title>
        )
    }

    const sceneKeys = activeChapter.scenes.map((scene) => scene.id);

    const superKey = sceneKeys.join();


    const leftPanel = (
        <LeftPanel key={`${activeChapter.id} ${activeChapter.updated_on} ${superKey}`}/>
    )


    return (
        <BookContext.Provider value={bookContextValue}>
            <AppShell
                classNames={{
                    main: classes.main
                }}
                fixed
                navbar={leftPanel}
                header={
                    <Header height={60}>
                        <Group
                            align='center'
                            position='apart'
                            h={60}
                            px='xs'
                        >
                            <Title order={1}>{bookTitle}</Title>
                            <Switch
                                checked={colorScheme === 'dark'}
                                onChange={onToggleColorScheme}
                                size='lg'
                                onLabel={
                                    <IconMoonStars
                                        color={theme.white}
                                        size='1.25rem'
                                        stroke={1.5}
                                    />
                                }
                                offLabel={
                                    <IconSun
                                        color={theme.colors.gray[6]}
                                        size='1.25rem'
                                        stroke={1.5}
                                    />
                                }
                            />
                        </Group>
                    </Header>
                }
                padding={0}
            >
                <Box
                    px='md'
                    py='sm'
                >
                    {rightPanel}
                </Box>
            </AppShell>
        </BookContext.Provider>
    )
}
