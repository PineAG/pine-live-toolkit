import React, { useRef, CSSProperties, useState, useEffect } from "react";
import { Size } from "../../store";
import { AutoScaleContext } from "../context";

const styleAutoScale: CSSProperties = {
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    position: "absolute",
    margin: 0
}

export interface AutoScaleProps {
    internalSize: Size
    children: React.ReactElement | React.ReactElement[]
}

function useAutoScale(ref: React.RefObject<HTMLDivElement>, internalSize: Size): number {
    const [externalSize, setExternalSize] = useState<Size>(internalSize)
    useEffect(() => {
        if(ref.current === null) {
            setExternalSize(internalSize)
            return
        }
        const listener = () => {
            if(ref.current === null) return;
            const {width, height} = ref.current.getBoundingClientRect()
            setExternalSize({width, height})
            console.log({width, height})
        }
        window.addEventListener("resize", listener)
        listener()
        return () => {
            window.removeEventListener("resize", listener)
        }
    }, [])
    if(ref.current === null) {
        return 1
    }
    const refSize = externalSize
    const widthScale = refSize.width / internalSize.width
    const heightScale = refSize.height / internalSize.height
    return Math.max(widthScale, heightScale)
}

export function AutoScale(props: AutoScaleProps) {
    const ref = useRef<HTMLDivElement>(null)
    const scale = useAutoScale(ref, props.internalSize)
    return <div ref={ref} style={styleAutoScale}>
        <AutoScaleContext.Provider value={scale}>
            {props.children}
        </AutoScaleContext.Provider>
    </div>
}