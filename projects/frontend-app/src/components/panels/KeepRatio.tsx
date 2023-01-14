import {useRef, useState, useEffect} from "react"
import { Rect, Size } from "@pltk/protocol"
import { Rnd } from "react-rnd"
import { PanelSize, PanelSizeContext } from "../context"
import { Loading } from "@pltk/components"

interface KeepRatioProps {
    internalSize: Size
    children: React.ReactElement | React.ReactElement[]
}

export const KeepRatio = (props: KeepRatioProps) => {
    const outRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [outRect, setOutRect] = useState<Rect>({x: 0, y: 0, width: 1, height: 1})

    const isOutRefAvailable = outRef.current !== null
    useEffect(() => {
        if(outRef.current) {
            const {width, height, x, y} = outRef.current.getBoundingClientRect()
            setOutRect({width, height, x, y})
            const widthScale = width / props.internalSize.width
            const heightScale = height / props.internalSize.height
            setScale(Math.min(widthScale, heightScale))
        }
    }, [outRef.current])

    const fixedRatio = props.internalSize.width / props.internalSize.height

    const panelSize: PanelSize = {
        scale,
        configSize: props.internalSize,
        actualRect: {
            x: outRect.x, y: outRect.y,
            width: props.internalSize.width * scale,
            height: props.internalSize.height * scale
        }
    }

    function onResize(newRect: Rect) {
        const width = newRect.width
        const scale = width / props.internalSize.width
        setScale(scale)
    }

    const internal = outRef.current === null ? <Loading/> : (
        <Rnd size={{
            width: props.internalSize.width * scale,
            height: props.internalSize.height * scale
        }}
        disableDragging={true}
        enableResizing={{right: true, bottom: true, bottomRight: true}}
        lockAspectRatio={fixedRatio} 
        onResize={(e, direction, ref, delta, position) => onResize(ref.getBoundingClientRect())}
        style={{
            outlineStyle: "solid",
            outlineWidth: "1px",
            outlineColor: "black",
            overflow: "hidden"
        }}
        >
            <PanelSizeContext.Provider value={panelSize}>
                {props.children}
            </PanelSizeContext.Provider>
        </Rnd>
    )

    return <>
    <div style={{position: "absolute", width: "100%", height: "100%"}} ref={outRef}>
        {internal}
    </div>
    </>
}
