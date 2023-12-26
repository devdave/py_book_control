import {Divider, Flex} from '@mantine/core'
import { createRef, FC, MouseEventHandler, useEffect, useState, ReactNode, Children } from 'react'

// import { useViewportSize } from '@mantine/hooks'

const TopPanel: FC<{
    height: number | undefined
    setHeight: (value: number) => void
    minHeight: number
    children?: React.ReactNode
}> = ({ height,setHeight, minHeight, children }) => {
    const topRef = createRef<HTMLDivElement>()

    useEffect(() => {
        if (topRef.current) {
            if (!height) {
                setHeight(Math.max(topRef.current?.clientHeight, 350))
            }
            const gatedHeight = Math.max(height as number, minHeight)

            topRef.current.style.height = `${gatedHeight}px`
        }
    }, [topRef, height, minHeight, setHeight])

    return (
        <div
            ref={topRef}
            style={{
                width: '100%',
                zIndex: 0

            }}
        >
            {children}
        </div>
    )
}

interface HorizontalResizeablePanelsProps {
    children: ReactNode[]
}

export const HorizontalResizeablePanels: FC<HorizontalResizeablePanelsProps> = ({ children }) => {
    const dividerRef = createRef<HTMLDivElement>()
    const bottomPanelRef = createRef<HTMLDivElement>()

    const [dragging, setDragging] = useState(false)
    const [topHeight, setTopHeight] = useState<undefined | number>(undefined)
    const [separatorYPosition, setSeparatorYPosition] = useState<undefined | number>(undefined)
    // const { width: vpWidth } = useViewportSize()

    const onMouseDown: MouseEventHandler = (evt) => {
        setDragging(true)
        setSeparatorYPosition(evt.clientY)
    }

    const onMouseUp = () => {
        setDragging(false)
    }

    const onDocumentMouseMove = (evt: MouseEvent) => {
        if (dragging && topHeight && separatorYPosition) {
            const newTopHeight = topHeight + evt.clientY - separatorYPosition
            setSeparatorYPosition(evt.clientY)
            setTopHeight(newTopHeight)
        }
    }

    useEffect(() => {
        document.addEventListener('mousemove', onDocumentMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        return () => {
            document.removeEventListener('mousemove', onDocumentMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        }
    })

    if (Children.count(children) !== 2) {
        throw Error('Resizeable takes only 2 children.')
    }

    const topPanelElement = children[0]
    const bottomElement = children[1]
    // const startWidth = vpWidth * 0.7
    const minHeight = 300

    return (
        <Flex
            id='resizeableContainer'
            mih={50}
            gap='md'
            justify='center'
            align='flex-start'
            direction={"column"}

        >
            <TopPanel
                height={topHeight}
                setHeight={setTopHeight}
                // startingWidth={startWidth}
                minHeight={minHeight}
            >
                {topPanelElement}
            </TopPanel>
            <Divider
                size='xl'
                ref={dividerRef}
                label={"Divider"}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                style={{ cursor: 'grab'}}
            />
            <div
                ref={bottomPanelRef}
                style={{ flex: 1, minWidth: '14rem' }}
            >
                {bottomElement}
            </div>
        </Flex>
    )
}
