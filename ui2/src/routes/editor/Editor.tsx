import { useParams } from "react-router-dom";

import { useAppContext } from "@src/App.context.ts";
import {
    ActionIcon,
    AppShell,
    Group,
    LoadingOverlay,
    Switch,
    Title,
    useMantineColorScheme,
    useMantineTheme
} from "@mantine/core";
import {useMemo} from "react";
import {EditorContext} from "@src/routes/editor/Editor.context.ts";
import {SettingsDrawer} from "@src/common/SettingsDrawer.tsx";
import {IconMoonStars, IconSettings, IconSun} from "@tabler/icons-react";
import {useDisclosure} from "@mantine/hooks";
import {NavBar} from "@src/routes/editor/NavBar.tsx";



export const Editor = () => {
    const { bookBroker } = useAppContext();

    const { book_id } = useParams();

    const { isLoading, isError, data: book } = bookBroker.fetch(book_id as string);


    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const theme = useMantineTheme();

    const [opened, { open, close }] = useDisclosure(false);

    // const [navOpened, {openNav:open, closeNav:close}] = useDisclosure(true)

    const editorContextValue = useMemo(()=>({
        book
    }),[book])


    console.log("Editor got ", book);

    if(isLoading){
        return (
            <LoadingOverlay visible>
                <h1>Book is loading</h1>
            </LoadingOverlay>
        )
    }

    if(isError||!book) {
        return (
            <>
                <h1>There was an error</h1>
                <p>I am currently unable to load the requested book</p>
            </>
        )
    }



    const header = (
        <AppShell.Header>
            <SettingsDrawer opened={opened} close={close} />
            <Group align="center" justify="space-between">
                <Title order={1}>{book.title}</Title>
                <Group>
                    <ActionIcon onClick={open}>
                        <IconSettings />
                    </ActionIcon>
                    <Switch
                        checked={colorScheme === "dark"}
                        onChange={toggleColorScheme}
                        size="lg"
                        onLabel={
                            <IconMoonStars color={theme.white} size="1.25rem" stroke={1.5} />
                        }
                        offLabel={
                            <IconSun
                                color={theme.colors.gray[6]}
                                size="1.25rem"
                                stroke={1.5}
                            />
                        }
                    />
                </Group>
            </Group>
        </AppShell.Header>
    );



    return (
        <EditorContext.Provider value={editorContextValue}>
            <AppShell header={{height:64}}
                navbar={{width:220, breakpoint:"md" }}>
                {header}
                {<NavBar book={book}/>}
                <AppShell.Main>
                    <h2>Book!</h2>
                    <i>
                        Book is <pre style={{ width:'70vw', wordWrap:"break-word"}} >{JSON.stringify(book,null,4)}</pre>


                    </i>
                </AppShell.Main>
            </AppShell>

        </EditorContext.Provider>
    );
};
