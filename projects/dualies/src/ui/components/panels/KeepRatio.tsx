import { useEffect, useRef, useState } from "react"
import { Rnd } from "react-rnd"
import { Size } from "../../backend"
import { PanelSizeContext } from "../context"

function useRatio(internalSize: Size): [number, React.Dispatch<React.SetStateAction<number>>, React.RefObject<HTMLDivElement>] {
    const ref = useRef<HTMLDivElement>(null)
    const [ratio, setRatio] = useState(1)
    useEffect(() => {
        if(ref.current === null) {
            return;
        }
        const width = ref.current.clientWidth
        const height = ref.current.clientHeight
        const ratioWidth = width / internalSize.width
        const ratioHeight = height / internalSize.height
        const newRatio = Math.min(ratioWidth, ratioHeight);
        setRatio(newRatio)
    }, [internalSize, ref.current, ref.current?.clientWidth, ref.current?.clientHeight])
    return [ratio, setRatio, ref]
}

interface KeepRatioProps {
    internalSize: Size
    children: React.ReactElement | React.ReactElement[]
}

export const KeepRatio = (props: KeepRatioProps) => {
    const [ratio, setRatio, ref] = useRatio(props.internalSize)
    const fixedRatio = props.internalSize.width / props.internalSize.height
    return <div ref={ref} style={{position: "absolute", width: "100%", height: "100%"}}>
        <Rnd size={{
                width: props.internalSize.width * ratio,
                height: props.internalSize.height * ratio
            }} 
            disableDragging={true}
            enableResizing={{right: true, bottom: true, bottomRight: true}}
            lockAspectRatio={fixedRatio} 
            onResize={(e, direction, ref, delta, position) => {
                setRatio(ref.offsetWidth / props.internalSize.width)
            }}
            style={{
                outlineStyle: "solid",
                outlineWidth: "1px",
                outlineColor: "black",
                overflow: "hidden"
            }}
            >
                <PanelSizeContext.Provider value={{scale: ratio, width: props.internalSize.width, height: props.internalSize.height}}>
                    {props.children}
                </PanelSizeContext.Provider>
        </Rnd>
    </div>
}
