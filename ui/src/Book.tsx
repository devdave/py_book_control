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
import {IconSun, IconMoonStars} from '@tabler/icons-react'
import {clone, find, forEach, map} from 'lodash'

import {FC, useCallback, useEffect, useMemo, useState} from 'react'

import InputModal, {PromptModal} from "./lib/input_modal";

import {BookContext} from './Book.context'
import {LeftPanel} from './LeftPanel'
import {RightPanel} from './RightPanel'
import {type Chapter, type Scene} from './types'
import APIBridge from "./lib/remote";
import Boundary from "./lib/boundary";


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

    const addScene = useCallback(
        async (chapterId: string) => {

            console.log("addScene chapter.id=", chapterId);

            const sceneTitle: string = await PromptModal("New scene title");
            if (sceneTitle.trim().length <= 2) {
                alert("Scene's must have a title longer than 2 characters.");
                return;
            }
            const newScene = await api.create_scene(chapterId, sceneTitle);


            _setChapters((prevChapters) =>
                map(prevChapters, (chapter) => {
                    if (chapter.id === chapterId) {
                        const scene = newScene; //createScene(chapter.id, sceneId, sceneTitle, chapter.scenes.length + 1)
                        const updatedChapter: Chapter = {
                            ...chapter,
                            scenes: [...chapter.scenes, scene]
                        }

                        _setActiveChapter(updatedChapter)
                        _setActiveScene(scene)

                        return updatedChapter
                    }

                    return chapter
                })
            );

        },
        []
    )
    const getChapter = useCallback((chapterId: string) => find(chapters, ['id', chapterId]), [chapters])
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
        (chapterId: string, from: number, to: number) =>
            _setChapters((prevChapters) =>
                map(prevChapters, (chapter) => {
                    if (chapter.id === chapterId) {
                        // make a clone of the scenes array, so we don't mutate it in place
                        const nextScenes = clone(chapter.scenes)

                        // reorder the scenes array
                        nextScenes.splice(to, 0, nextScenes.splice(from, 1)[0])

                        const nextChapter: Chapter = {
                            ...chapter,
                            // iterate over each item and overwrite its new sequence
                            scenes: map(nextScenes, (scene, sceneIdx) => ({
                                ...scene,
                                order: sceneIdx + 1
                            }))
                        }

                        _setActiveChapter(nextChapter)

                        return nextChapter
                    }

                    return chapter
                })
            ),
        []
    )


    const setActiveChapter = useCallback( async (chapter: Chapter) => {
        if(activeChapter !== undefined){
            activeChapter.notes = "";
            activeChapter.summary = "";
            forEach(activeChapter.scenes, (scene)=>{
                scene.notes = "";
                scene.content = "";
                scene.summary = "";
            })
        }
        chapter = await api.fetch_chapter(chapter.id);
        _setActiveChapter(chapter)
        _setActiveScene(chapter.scenes[0])
    }, [])

    const setActiveScene = useCallback((chapter: Chapter, scene: Scene) => {
        _setActiveChapter(chapter);
        _setActiveScene(scene);

    }, []);

    const updateChapter = useCallback(
        async (chapter: Chapter) => {

            const result = await api.update_chapter(chapter.id, chapter);
            if (result === false) {
                alert("Warning!  Failed to save chapter changes.");
                return;
            }

            console.log("Would update chapter with ", chapter);

            _setChapters((prevChapters) =>
                map(prevChapters, (prevChapter) => (prevChapter.id === chapter.id ? chapter : prevChapter))
            );
        },

        []);

    const updateScene = useCallback(
        async (scene: Scene) => {
            console.log("updateScene", scene);

            const chapter = getChapter(scene.chapterId);

            const result = await api.update_scene(scene.id, scene);

            if (result !== true) {
                alert("Failed to update scene!");
                return;
            }

            if (chapter) {
                await updateChapter({
                    ...chapter,
                    scenes: map(chapter.scenes, (prevScene) => (prevScene.id === scene.id ? scene : prevScene))
                })
            }
        },
        [getChapter, updateChapter]
    );

    const onToggleColorScheme = useCallback(() => toggleColorScheme(), [toggleColorScheme])

    const bookContextValue = useMemo(
        () => ({
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
            updateScene
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
            updateScene
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

    if (fetchedBook === false) {
        return (
            <LoadingOverlay visible={true}/>
        );
    }

    return (
        <BookContext.Provider value={bookContextValue}>
            <AppShell
                classNames={{
                    main: classes.main
                }}
                fixed
                navbar={<LeftPanel/>}
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
                    {activeChapter !== null && activeScene !== null &&
                        <RightPanel key={`${activeChapter?.id}-${activeScene?.id}`}/>
                    }
                    {activeChapter === null &&
                        <>
                            <div>Create a chapter!</div>
                        </>
                    }
                </Box>
            </AppShell>
        </BookContext.Provider>
    )
}
