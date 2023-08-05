import React, { useCallback, useState } from 'react'
import {
    AppShell,
    Button,
    Center,
    createStyles,
    Divider,
    Group,
    Header,
    LoadingOverlay,
    Space,
    Stepper,
    Switch,
    Text,
    Title,
    useMantineColorScheme
} from '@mantine/core'
import { ImporterGreeting } from '@src/modes/book_importer/ImporterGreeting'
import { InitialSetup } from '@src/modes/book_importer/InitialSetup'
import { DocumentSelector } from '@src/modes/book_importer/DocumentSelector'
import { IconMoonStars, IconSun } from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@src/App.context'
import { VerifyImport } from '@src/modes/book_importer/VerifyImport'
import { BatchBroker } from '@src/modes/book_importer/lib/BatchBroker'

const useStyles = createStyles((styles_theme) => ({
    header_main: {
        colorScheme: styles_theme.colorScheme,
        backgroundColor: styles_theme.colorScheme === 'light' ? 'white' : 'black'
    }
}))

export const BookImporter = () => {
    const { api } = useAppContext()
    const queryClient = useQueryClient()

    const batchBroker = BatchBroker({ api, queryClient })

    const [active, setActive] = useState(0)

    const { theme } = useStyles()
    const { colorScheme, toggleColorScheme } = useMantineColorScheme()

    const onToggleColorScheme = useCallback(() => toggleColorScheme(), [toggleColorScheme])

    const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current))
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current))

    const { data: batch, isLoading: batchLoading, status: batchStatus } = batchBroker.fetch()

    if (batchLoading) {
        return (
            <>
                <Title>Starting import wizard</Title>
                <LoadingOverlay visible />
            </>
        )
    }

    if (!batch) {
        return (
            <>
                <Text>Failed to load the batch memory object</Text>
            </>
        )
    }

    const header = (
        <Header height='6em'>
            <Group position='apart'>
                <Title>Book importer</Title>
                <Group>
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
            </Group>
        </Header>
    )

    return (
        <AppShell header={header}>
            <Stepper
                active={active}
                onStepClick={setActive}
                breakpoint='sm'
            >
                <Stepper.Step
                    label='Greeting'
                    description='A greeting'
                >
                    <ImporterGreeting />
                </Stepper.Step>
                <Stepper.Step
                    label='Book options'
                    description='Create a blank book to import into.'
                >
                    <InitialSetup />
                </Stepper.Step>
                <Stepper.Step
                    label='Document selection'
                    description='Select the documents to import'
                >
                    <DocumentSelector
                        batch={batch}
                        nextStep={nextStep}
                    />
                </Stepper.Step>
                <Stepper.Step
                    label='Verify everything'
                    description='A quick sanity check'
                >
                    <VerifyImport batch={batch} />
                </Stepper.Step>
            </Stepper>
            <Space h='md' />
            <Divider />
            <Space h='md' />
            <Center>
                <Button onClick={prevStep}>Go back</Button>
                <Button onClick={nextStep}>Next step</Button>
            </Center>
        </AppShell>
    )
}
