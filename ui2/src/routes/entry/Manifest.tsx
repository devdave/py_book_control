import {
    ActionIcon,
    AppShell,
    Group,
    LoadingOverlay,
    Paper,
    Skeleton,
    Switch,
    Table,
    Text,
    Title,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { SettingsDrawer } from "@src/common/SettingsDrawer.tsx";
import { useDisclosure } from "@mantine/hooks";
import { useAppContext } from "@src/App.context.ts";
import { UID } from "@src/types.ts";
import React, { MouseEventHandler, useState } from "react";

import classes from "./manifest.module.css";

import {
    IconMoonStars,
    IconSettings,
    IconSun,
    IconX,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export const Manifest = () => {
    const navigate = useNavigate();

    const { bookBroker } = useAppContext();

    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const theme = useMantineTheme();

    const [opened, { open, close }] = useDisclosure(false);

    const { data: books, isLoading: booksAreLoading } = bookBroker.fetchAll();
    const [highlightBookID, setHighLightBookID] = useState<UID | undefined>();

    const { data: highlightedBook } = bookBroker.fetch(highlightBookID as UID);

    const handleMouseEnter: MouseEventHandler<HTMLElement> = (evt) => {
        evt.currentTarget.classList.add("highlight");
        setHighLightBookID(evt.currentTarget.dataset.bookId);
    };

    const handleMouseLeave: React.MouseEventHandler<HTMLElement> = (evt) => {
        evt.currentTarget.classList.remove("highlight");
        setHighLightBookID(undefined);
    };

    const handleClick: React.MouseEventHandler<HTMLElement> = (evt) => {
        if (highlightedBook) {
            navigate(`/book/${highlightedBook.id}`);
        }
        evt.preventDefault(); 
    };

    if (booksAreLoading) {
        return (
            <Group justify="center">
                <LoadingOverlay visible={true} overlayProps={{ radius: "xl", blur: 2 }}>
                    <h2>Loading</h2>
                    <Skeleton height={12} radius="xl" />
                    <Skeleton height={12} radius="xl" />
                    <Skeleton height={12} radius="xl" />
                </LoadingOverlay>
            </Group>
        );
    }

    const header = (
        <AppShell.Header>
            <SettingsDrawer opened={opened} close={close} />
            <Group align="center" justify="space-between">
                <Title order={1}>Open or create a new book</Title>
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
        <AppShell header={{ height: 80 }}>
            {header}

            <AppShell.Main>
                <fieldset>
                    <legend>Books</legend>
                    <Table
                        stickyHeader
                        stickyHeaderOffset={60}
                        className={classes.bookList}
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Title</Table.Th>
                                <Table.Th>Word count</Table.Th>
                                <Table.Th>Type</Table.Th>
                                <Table.Th>Chapters</Table.Th>
                                <Table.Th>Updated at</Table.Th>
                                <Table.Th>Created at</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {books &&
                books.map((book) => (
                    <Table.Tr
                        className="bookRow"
                        title={"Click to open"}
                        key={book.id}
                        data-book-id={book.id}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleClick}
                    >
                        <Table.Td
                            data-book-id={book.id}
                            style={{ cursor: "pointer" }}
                        >
                            {book.title}
                        </Table.Td>
                        <Table.Td>
                            {parseInt(String(book.words), 10)?.toLocaleString()}
                        </Table.Td>
                        <Table.Td>{book.operation_type}</Table.Td>
                        <Table.Td>{book.chapters && book.chapters.length}</Table.Td>
                        <Table.Td>{book.updated_on}</Table.Td>
                        <Table.Td>{book.created_on}</Table.Td>
                        <Table.Td>
                            <ActionIcon>
                                <IconX />
                            </ActionIcon>
                        </Table.Td>
                    </Table.Tr>
                ))}
                        </Table.Tbody>
                    </Table>
                </fieldset>

                <Title order={5}>Chapter notes</Title>
                <Paper shadow="lg" p="md" withBorder>
                    {(function quick() {
                        if (highlightBookID === undefined) {
                            return <Text>Hover over a book to see its notes</Text>;
                        }
                        if (highlightedBook) {
                            if (highlightedBook.notes.length <= 0) {
                                return <Text>There are no notes</Text>;
                            }
                            if (highlightedBook.notes.length > 0) {
                                return <Text>Notes: {highlightedBook.notes}</Text>;
                            }
                        }
                        return <Text>Failed to fetch book notes.</Text>;
                    })()}
                </Paper>
            </AppShell.Main>
        </AppShell>
    );
};
