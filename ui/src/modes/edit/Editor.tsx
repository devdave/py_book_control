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
import {assignWith, clone, find, forEach, map} from 'lodash'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {PromptModal} from "@src/lib/input_modal";

import {EditorContext} from './Editor.context'
import {LeftPanel} from './LeftPanel'
import {RightPanel} from '@src/modes/edit/editor_panel/RightPanel';
import {ContinuousBody} from '@src/modes/edit/continuous_panel';

import {type Chapter, type Scene, type SceneIndex, type ChapterIndex, ViewModes} from '@src/types'
import APIBridge from "@src/lib/remote";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {ToggleInput} from "@src/lib/ToggleInput";


const useStyles = createStyles((theme) => ({
    main: {
        backgroundColor: theme.colorScheme === 'light' ? theme.colors.gray[0] : theme.colors.dark[6]
    }
}))

interface EditorProps {
    api: APIBridge
    bookId: string
    bookTitle: string | undefined
}

export const Editor: React.FC<EditorProps> = ({api, bookId, bookTitle}) => {


    const {classes, theme} = useStyles()
    const {colorScheme, toggleColorScheme} = useMantineColorScheme()

    const [chapters, _setChapters] = useState<ChapterIndex[]>([]);
    const [activeChapter, _setActiveChapter] = useState<ChapterIndex | Chapter | undefined>(undefined);
    const [activeScene, _setActiveScene] = useState<SceneIndex | Scene | undefined>(undefined);
    const [viewMode, setViewMode] = useState<"list" | "flow">("list");
    const queryClient = useQueryClient();

    const {isLoading: indexIsloading, data: index, dataUpdatedAt: indexUpdatedAt} = useQuery({
        queryKey: ['book', bookId, 'index'],
        queryFn: (key) => {
            return api.fetch_stripped_chapters()
        }
    });

    useEffect(()=>{
        if(!indexIsloading){
            if(activeChapter === undefined){
                if(index.length > 0){
                    _setActiveChapter(index[0]);
                    if(index[0].scenes.length > 0){
                        _setActiveScene(index[0].scenes[0]);
                    }
                }
            }
            if(activeScene == undefined && activeChapter && activeChapter.scenes.length > 0){
                _setActiveScene(activeChapter.scenes[0]);
            }
        }
    }, [index, indexUpdatedAt])

    const changeBookTitle = useMutation({
        mutationFn: (new_title: string) => api.update_book_title(bookId, new_title)
    })

    const createChapter = useMutation({
        mutationFn: (newChapter: object) => api.create_chapter(newChapter),
        onSuccess: (response) => {
            console.log(response);
            queryClient.invalidateQueries({queryKey: ['book', bookId]});
        }
    });

    const addChapter = useCallback(
        async () => {

            const chapterTitle: string = await PromptModal("New chapter title");
            if (chapterTitle.trim().length <= 2) {
                alert("Chapter's must have a title longer than 2 characters.");
                return;
            }
            createChapter.mutate({book_id: bookId, title: chapterTitle});
        },
        []
    );

    const _addScene = useMutation({
        mutationFn: (newScene: { [key:string]:string }) => api.create_scene(newScene['chapterId'], newScene['title']),
        onSuccess: (newScene:Scene, newSceneParts:Partial<Scene>, context)  => {
            console.log("Mutating addScene", newScene, newSceneParts, context);
            queryClient.invalidateQueries(['book', bookId, 'chapter']);
            queryClient.invalidateQueries(['book', bookId, 'index']);
            _setActiveScene(newScene);
        }
    })

    const createScene = useCallback(async (chapterId: string, sceneTitle: string, position = -1, content = '') => {
            // @ts-ignore I don't care that position is the "wrong" type
            _addScene.mutate({chapterId: chapterId, title: sceneTitle, position: position, content: content});
        },
        [index]);


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

    const getChapter = async (chapterId: string) => {
        const {data} = useQuery({
            queryKey: ["book", bookId, "chapter", chapterId],
            queryFn: () => api.fetch_chapter(chapterId)
        });
        return data;
    }

    const reorderChapter = useCallback(
        async (from: number, to: number) => {
            const response = await api.reorder_chapter(from, to);
            queryClient.invalidateQueries({queryKey:['book', bookId, 'chapter']});
        },
        []
    )

    const reorderScene = useCallback(
        async (chapterId: string, from: number, to: number) => {
            const response = await api.reorder_scene(chapterId, from, to)
            queryClient.invalidateQueries(['book', bookId, 'chapter']);
        },
        []
    )


    const setActiveChapter = useCallback(async (chapter: Chapter) => {

        if(activeChapter && activeChapter.id != chapter.id){
            if(chapter.scenes.length > 0){
                _setActiveScene(chapter.scenes[0]);
            } else {
                _setActiveScene(undefined);
            }
        }

        _setActiveChapter(chapter);

    }, [])

    const setActiveScene = useCallback((chapter: Chapter, scene: Scene) => {
        _setActiveChapter(chapter);
        _setActiveScene(scene);

    }, []);

    const changeChapter = useMutation({
        mutationFn: (alterChapter:Chapter) => api.update_chapter(alterChapter.id, alterChapter),
        mutationKey: ['book', bookId, 'chapter'],
        onSuccess: (response) => {
            queryClient.invalidateQueries({queryKey:['book', bookId]});
        }
        }
    )

    const updateChapter = useCallback(
        async (chapter: Chapter) => {

            changeChapter.mutate(chapter);

        },

        []);

    const changeScene = useMutation({
        mutationFn: (alteredScene:Scene) => api.update_scene(alteredScene.id, alteredScene),
        onSuccess: (response)=> {
            queryClient.invalidateQueries(['book', bookId, 'chapter']);
        }
    })

    const updateScene = useCallback(
        async (scene: Scene) => {
            changeScene.mutate(scene);
        },
        []
    );

    const _deleteScene = useMutation({
        mutationFn: ({chapterId, sceneId}:{chapterId:string, sceneId:string}) => api.delete_scene(chapterId, sceneId),
        onSuccess: async (data, {chapterId, sceneId}, context) => {
            console.log("Deleted scene", data, chapterId, sceneId, context);
            await queryClient.invalidateQueries(['book', bookId, 'chapter', chapterId]);
            await queryClient.invalidateQueries(['book', bookId, 'index']);
        }
    });

    const deleteScene = useCallback(
        async (chapterId: string, sceneId: string) => {

            const target:Scene|SceneIndex|undefined|any = find(activeChapter?.scenes, (scene)=>{
                if(scene.id == sceneId){
                    return scene;
                }
            });

            _deleteScene.mutate({chapterId, sceneId});

            if(target && target.order > 0){
                const newSceneOrderPos = target.order - 1;
                const newFocus: Scene|SceneIndex|any = find(activeChapter?.scenes, (scene)=>{
                    if(scene.order == newSceneOrderPos){
                        return scene;
                    }
                });

                if(newFocus){
                    _setActiveScene(newFocus);
                }
            } else {
                _setActiveScene(undefined);
            }

        }
        , []);

    const fetchScene = async (sceneId: string) => {
        const {data} = useQuery({
            queryKey: ['book', bookId, 'scene', sceneId],
            queryFn: () => api.fetch_scene(sceneId)
        });
        return data;
    }

    const onToggleColorScheme = useCallback(() => toggleColorScheme(), [toggleColorScheme])

    const bookContextValue = useMemo(
        () => ({
            index,
            bookId,
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
            fetchScene,
            setViewMode,
            _setChapters,
            _setActiveChapter,
            _setActiveScene,
        }),
        [
            index,
            bookId,
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
            deleteScene,
            fetchScene,
            setViewMode,
            _setChapters,
            _setActiveChapter,
            _setActiveScene,
        ]
    );

    useEffect(() => {
        const fetchChapters = async () => {
            if (index.length > 0) {
                _setActiveChapter(index[0].id)
                if (index[0].scenes.length > 0) {
                    _setActiveScene(index[0].scenes[0].id)
                }
            }
        }
    }, [index]);

    if (indexIsloading) {
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
                    <RightPanel key={`${activeChapter}-${activeScene}`}/>
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


    const sceneKeys = (activeChapter)
        ? activeChapter.scenes.map((scene) => scene.id)
        : [];

    const superKey = sceneKeys.join();


    const leftPanel = (
        <LeftPanel index={index} key={`${activeChapter.id} ${indexUpdatedAt} ${superKey}`}/>
    )


    return (
        <EditorContext.Provider value={bookContextValue}>
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
                            <ToggleInput value={bookTitle} onChange={(newVal)=>changeBookTitle.mutate(newVal)} />
                            {/*<Title order={1}>{bookTitle}</Title>*/}
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
        </EditorContext.Provider>
    )
}
