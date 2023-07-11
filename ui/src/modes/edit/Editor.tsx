import {
    ActionIcon,
    AppShell,
    Box,
    createStyles,
    Group,
    Header,
    LoadingOverlay,
    Switch,
    useMantineColorScheme
} from '@mantine/core'
import {IconArrowBack, IconMoonStars, IconSun} from '@tabler/icons-react'
import {find} from 'lodash'

import {useCallback, useEffect, useMemo, useState} from 'react'

import {PromptModal} from "@src/widget/input_modal";

import {EditorContext, type EditorContextValue} from './Editor.context'
import {LeftPanel} from './LeftPanel'
import {Body} from "@src/modes/edit/Body";


import {AppModes, type Chapter, type ChapterIndex, EditModes, type Scene, type SceneIndex} from '@src/types'
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {ToggleInput} from "@src/widget/ToggleInput";
import {useAppContext} from "@src/App.context";


const useStyles = createStyles((theme) => ({
    main: {
        backgroundColor: theme.colorScheme === 'light' ? theme.colors.gray[0] : theme.colors.dark[6]
    }
}))

interface EditorProps {

}

export const Editor: React.FC<EditorProps> = () => {

    const {api, activeBook, setAppMode} = useAppContext();

    const {classes, theme} = useStyles()
    const {colorScheme, toggleColorScheme} = useMantineColorScheme()

    const [chapters, _setChapters] = useState<ChapterIndex[]>([]);

    const [activeElement, _setActiveElement] = useState();
    const [activeChapter, _setActiveChapter] = useState<ChapterIndex | Chapter | undefined>(undefined);
    const [activeScene, _setActiveScene] = useState<SceneIndex | Scene | undefined>(undefined);

    const [editMode, setEditMode] = useState<EditModes>(EditModes.LIST);
    const queryClient = useQueryClient();

    const {isLoading: indexIsloading, data: index, dataUpdatedAt: indexUpdatedAt} = useQuery({
        queryKey: ['book', activeBook.id, 'index'],
        queryFn: (key) => {
            return api.fetch_stripped_chapters()
        }
    });

    useEffect(()=>{
        if(indexIsloading){
            _setActiveChapter(undefined);
            _setActiveScene(undefined);
            return;
        }

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
    }, [activeBook, index, indexUpdatedAt])

    const changeBookTitle = useMutation({
        mutationFn: (new_title: string) => api.update_book_title(activeBook.id, new_title),
        onSuccess: (response, new_title) => {
            queryClient.invalidateQueries({queryKey: ['book', activeBook.id, 'index']});
            activeBook.title = new_title;
        }
    })

    const createChapter = useMutation({
        mutationFn: (newChapter: object) => api.create_chapter(newChapter),
        onSuccess: (response) => {
            console.log(response);
            queryClient.invalidateQueries({queryKey: ['book', activeBook.id]});
        }
    });

    const addChapter = useCallback(
        async () => {

            const chapterTitle: string = await PromptModal("New chapter title");
            if (chapterTitle.trim().length <= 2) {
                alert("Chapter's must have a title longer than 2 characters.");
                return;
            }
            createChapter.mutate({book_id: activeBook.id, title: chapterTitle});
        },
        []
    );

    const _addScene = useMutation({
        mutationFn: (newScene: { [key:string]:string }) => api.create_scene(newScene['chapterId'], newScene['title']),
        onSuccess: (newSceneAndChapter:[Scene,Chapter], newSceneParts:Partial<Scene>, context)  => {
            console.log("Added a new scene: ", newSceneAndChapter);
            _setActiveScene(newSceneAndChapter[0]);
            _setActiveChapter(newSceneAndChapter[1]);

            queryClient.invalidateQueries(['book', activeBook.id, 'chapter']);
            queryClient.invalidateQueries(['book', activeBook.id, 'chapter', newSceneParts['chapterId']]);
            queryClient.invalidateQueries(['book', activeBook.id, 'index']);


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
        return await api.fetch_chapter(chapterId);
    }

    const reorderChapter = useCallback(
        async (from: number, to: number) => {
            const response = await api.reorder_chapter(from, to);
            await queryClient.invalidateQueries({queryKey:['book', activeBook.id, 'index']});
        },
        []
    )

    const reorderScene = useCallback(
        async (chapterId: string, from: number, to: number) => {
            const response = await api.reorder_scene(chapterId, from, to)
            await queryClient.invalidateQueries(['book', activeBook.id, 'chapter']);
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
        mutationKey: ['book', activeBook.id, 'chapter'],
        onSuccess: (response) => {
            queryClient.invalidateQueries({queryKey:['book', activeBook.id]});
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
        onSuccess: (sceneAndChapter:[Scene, Chapter], request:Partial<Scene>)=> {
            console.log("changed scene", sceneAndChapter);
            if(activeChapter?.id == sceneAndChapter[1].id){
                console.log("Updated activeChapter")
                _setActiveChapter(sceneAndChapter[1]);
            }
            if(activeScene?.id == sceneAndChapter[0].id){
                console.log("Updated activeScene")
                _setActiveScene(sceneAndChapter[0]);
            }

            queryClient.setQueryData(['book', activeBook.id, 'chapter', sceneAndChapter[1].id, 'scene', sceneAndChapter[0].id],
                (prior)=> {
                    return {
                        ...prior,
                        ...sceneAndChapter[0]
                    };
                });

            queryClient.invalidateQueries(['book', activeBook.id, 'chapter']);
            queryClient.invalidateQueries(['book', activeBook.id, 'chapter', sceneAndChapter[1].id]);
            queryClient.invalidateQueries(['book', activeBook.id, 'chapter', sceneAndChapter[1].id, 'scene', sceneAndChapter[0].id]);
            queryClient.invalidateQueries(['book', activeBook.id, 'index']);




        }
    })

    const updateScene = useCallback(
        async (scene: Scene) => {
            changeScene.mutate(scene);
            if(scene.id === activeScene?.id){
                _setActiveScene((prior)=>{
                    return {...prior, ...scene};
                });
            }
        },
        []
    );

    const _deleteScene = useMutation({
        mutationFn: ({chapterId, sceneId}:{chapterId:string, sceneId:string}) => api.delete_scene(chapterId, sceneId),
        onSuccess: async (data, {chapterId, sceneId}, context) => {
            console.log("Deleted scene", data, chapterId, sceneId, context);
            await queryClient.invalidateQueries(['book', activeBook.id, 'chapter', chapterId]);
            await queryClient.invalidateQueries(['book', activeBook.id, 'index']);

            _setActiveChapter((prior)=>{
                if(prior == undefined){
                    console.log("Error: somehow the user deleted a scene without there being an active chapter")
                    Error("Integrity issue: Deleted a scene without an active scene")
                    return;
                }
                prior.scenes = prior.scenes.filter((scene)=>scene.id != sceneId);
                prior.updated_on = new Date(Date.now()).toUTCString();
                return prior;
            })


        }
    });

    const deleteScene = useCallback(
        async (chapterId: string, sceneId: string) => {

            console.log("Deleting scene: ", chapterId, sceneId);
            const chapter:Chapter = await getChapter(chapterId);

            const target:Scene|SceneIndex|undefined|any = find(chapter.scenes, (scene)=>{
                if(scene.id == sceneId){
                    return scene;
                }
            });


            const newActiveScene: Scene|SceneIndex|undefined|any = find(chapter.scenes, (test)=>{
                if(test.order == target.order -1){
                    return test;
                }
            })

            _deleteScene.mutate({chapterId, sceneId});

            if(newActiveScene){
                _setActiveScene(newActiveScene);
            } else {
                _setActiveScene(undefined);
            }

        }
        , []);

    const fetchScene = async (sceneId: string) => {
        const {data} = useQuery({
            queryKey: ['book', activeBook.id, 'scene', sceneId],
            queryFn: () => api.fetch_scene(sceneId)
        });
        return data;
    }

    const onToggleColorScheme = useCallback(() => toggleColorScheme(), [toggleColorScheme])

    const editorContextValue = useMemo<EditorContextValue>(
        () => ({
            index,
            activeBook,
            activeChapter,
            activeScene,
            addChapter,
            addScene,
            createScene,
            chapters,
            editMode,
            api,
            reorderChapter,
            reorderScene,
            setActiveChapter,
            setActiveScene,
            updateChapter,
            updateScene,
            deleteScene,
            fetchScene,
            setEditMode,
            _setChapters,
            _setActiveChapter,
            _setActiveScene,
        }),
        [
            index,
            activeBook.id,
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
            setEditMode,
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



    const sceneKeys = (activeChapter)
        ? activeChapter.scenes.map((scene) => scene.id)
        : [];

    const superKey = sceneKeys.join();


    const leftPanel = (
        <LeftPanel index={index} key={`${activeChapter?.id} ${activeScene?.id}  ${activeBook.updated_on} ${indexUpdatedAt} ${superKey}`}/>
    )


    return (
        <EditorContext.Provider value={editorContextValue}>
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
                            <Group>
                                <ActionIcon
                                    title="Go back to book list"
                                    onClick={()=>{setAppMode(AppModes.MANIFEST)}}
                                ><IconArrowBack/></ActionIcon>
                                <ToggleInput title="Double click to edit"
                                             value={activeBook.title}
                                             onChange={(newVal) => changeBookTitle.mutate(newVal)}/>
                            </Group>

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
                    <Body/>
                </Box>
            </AppShell>
        </EditorContext.Provider>
    )
}
