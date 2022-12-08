import {useState, useEffect, useRef} from "react"
import { Plugin, usePluginSize } from "./base"
import moment from "moment"

interface ClockConfig {
    format: string
    color: string
}

function getCurrentTimeOnFormat(format: string) {
    return moment().format(format)
}

function useDate(format: string) {
    const [date, setDate] = useState(getCurrentTimeOnFormat(format))
    useEffect(() => {
        const timer = setInterval(() => setDate(getCurrentTimeOnFormat(format)), 1000)
        return () => clearInterval(timer)
    }, [])
    return date
}

interface ClockProps {
    config: ClockConfig
}

const Clock = (props: ClockProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const date = useDate(props.config.format)
    const [fontSize, setFontSize] = useState<number>(100)
    useEffect(() => {
        setFontSize(ref.current?.clientHeight ?? 100)
    }, [ref.current?.clientHeight])
    return <div ref={ref} style={{
            width: "100%",
            height: "100%",
            fontSize: fontSize * 0.8, 
            color: props.config.color
        }}>
        {date}
    </div>
}

const ClockConfiguration = () => {
    return <div/>
}

const ClockPlugin: Plugin<ClockConfig> = {
    type: "builtin.clock",
    initialize: {
        defaultConfig: () => ({
            format: "HH:mm",
            color: "white"
        }),
        defaultSize: () => ({width: 300, height: 200})
    },
    render: {
        preview: (conf) => <Clock config={conf}/>,
        move: (conf) => <Clock config={conf}/>,
        config: (config, setConfig) => <ClockConfiguration/>
    }
}

export default ClockPlugin