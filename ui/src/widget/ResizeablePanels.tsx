import { Divider, Flex } from '@mantine/core'
import { createRef, FC, MouseEventHandler, useEffect, useState, ReactNode, Children } from 'react'

// import { useViewportSize } from '@mantine/hooks'

const LeftPanel: FC<{
    leftWidth: number | undefined
    setLeftWidth: (value: number) => void
    minWidth: number
    children?: React.ReactNode
}> = ({ leftWidth, setLeftWidth, minWidth, children }) => {
    const leftRef = createRef<HTMLDivElement>()

    useEffect(() => {
        if (leftRef.current) {
            if (!leftWidth) {
                setLeftWidth(Math.max(leftRef.current?.clientWidth, 1000))
            }
            const gatedWidth = Math.max(leftWidth as number, minWidth)

            leftRef.current.style.width = `${gatedWidth}px`
        }
    }, [leftRef, leftWidth, minWidth, setLeftWidth])

    return (
        <div
            ref={leftRef}
            style={{
                height: '100%',
                width: '100%',
                boxSizing: 'border-box'
            }}
        >
            {children}
        </div>
    )
}

interface ResizeablePanelsProps {
    children: ReactNode[]
}

export const ResizeablePanels: FC<ResizeablePanelsProps> = ({ children }) => {
    const dividerRef = createRef<HTMLDivElement>()
    const rightPanelRef = createRef<HTMLDivElement>()

    const [dragging, setDragging] = useState(false)
    const [leftWidth, setLeftWidth] = useState<undefined | number>(undefined)
    const [separatorXPosition, setSeparatorXPosition] = useState<undefined | number>(undefined)
    // const { width: vpWidth } = useViewportSize()

    const onMouseDown: MouseEventHandler = (evt) => {
        setDragging(true)
        setSeparatorXPosition(evt.clientX)
    }

    const onMouseUp = () => {
        setDragging(false)
    }

    const onMouseMove: MouseEventHandler = (evt) => {
        if (dragging && leftWidth && separatorXPosition) {
            const newLeftWidth = leftWidth + evt.clientX - separatorXPosition
            setSeparatorXPosition(evt.clientX)
            setLeftWidth(newLeftWidth)
        }
    }

    const onDocumentMouseMove = (evt: MouseEvent) => {
        if (dragging && leftWidth && separatorXPosition) {
            const newLeftWidth = leftWidth + evt.clientX - separatorXPosition
            setSeparatorXPosition(evt.clientX)
            setLeftWidth(newLeftWidth)
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

    const left = children[0]
    const right = children[1]
    // const startWidth = vpWidth * 0.7
    const minWidth = 300

    return (
        <Flex
            id='resizeableContainer'
            mih={50}
            gap='md'
            justify='center'
            align='flex-start'
            direction='row'
            wrap='nowrap'
            style={{
                height: '100%'
            }}
        >
            <LeftPanel
                leftWidth={leftWidth}
                setLeftWidth={setLeftWidth}
                // startingWidth={startWidth}
                minWidth={minWidth}
            >
                {left}
            </LeftPanel>
            <Divider
                size='xl'
                ref={dividerRef}
                orientation='vertical'
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                style={{ cursor: 'grab', padding: '0 6px 0 6px' }}
            />
            <div
                ref={rightPanelRef}
                style={{ flex: 1, height: '100%', position: 'relative', minWidth: '14rem' }}
            >
                {right}
            </div>
        </Flex>
    )
}
