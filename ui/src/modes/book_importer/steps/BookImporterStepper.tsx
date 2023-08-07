import React, { useState } from 'react'
import { Button, Center, Divider, Space, Stepper, Text } from '@mantine/core'
import { ImporterGreeting } from '@src/modes/book_importer/steps/ImporterGreeting'
import { InitialSetup } from '@src/modes/book_importer/steps/InitialSetup'
import { DocumentSelector } from '@src/modes/book_importer/steps/DocumentSelector'
import { VerifyImport } from '@src/modes/book_importer/steps/VerifyImport'
import { BatchSettings } from '@src/modes/book_importer/types'

interface BookImporterStepperProps {
    batch: BatchSettings
}

export const BookImporterStepper: React.FC<BookImporterStepperProps> = ({ batch }) => {
    const [active, setActive] = useState(0)

    const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current))
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current))

    return (
        <>
            <Stepper
                active={active}
                onStepClick={setActive}
                breakpoint='sm'
            >
                <Stepper.Step
                    label='Greeting'
                    description='A greeting'
                >
                    <ImporterGreeting nextStep={nextStep} />
                </Stepper.Step>
                <Stepper.Step
                    label='Book options'
                    description='Create a blank book to import into.'
                >
                    <InitialSetup nextStep={nextStep} />
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
            </Center>
        </>
    )
}
