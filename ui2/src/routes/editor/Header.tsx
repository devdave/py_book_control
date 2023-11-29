import {SettingsDrawer} from "@src/common/SettingsDrawer.tsx";
import {ActionIcon, AppShell, Group, Space, Switch, useMantineColorScheme, useMantineTheme} from "@mantine/core";
import {IconArrowBack, IconMoonStars, IconSettings, IconSun} from "@tabler/icons-react";
import {useDisclosure} from "@mantine/hooks";
import {Book} from "@src/types.ts";
import {useNavigate} from "react-router-dom";
import {useAppContext} from "@src/App.context.ts";
import {ToggleInput} from "@src/widget/ToggleInput.tsx";

export const Header = ({book}:{book:Book}) => {

    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const theme = useMantineTheme();

    const [opened, { open, close }] = useDisclosure(false);

    const navigate = useNavigate()

    const {bookBroker} = useAppContext()

    const doGoBack = () => { navigate("/") }

    const handleTitleUpdate = (newTitle:string) => { bookBroker.update({id:book.id, title: newTitle})}

    return (
        <AppShell.Header>
            <SettingsDrawer opened={opened} close={close} />
            <Space w="xl"/>
            <Group align="center" justify="space-between">
                <Group
                    align='center'
                    justify={"space-evenly"}
                    h={60}
                    px='xs'
                >
                    <ActionIcon
                        title='Go back to book list'
                        onClick={doGoBack}
                        style={{backgroundColor:theme.colors.gray[0], color: theme.colors.dark[0]}}
                    >
                        <IconArrowBack />
                    </ActionIcon>
                    <ToggleInput value={book.title} onChange={handleTitleUpdate} title={book.title}/>

                </Group>

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
    )
}
