import {useState, useEffect, CSSProperties} from "react"
import { Plugin } from "./base"
import moment from "moment"

interface ClockConfig {
    format: string
    fontSize: number
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
    const date = useDate(props.config.format)
    return <div style={{fontSize: props.config.fontSize, color: props.config.color}}>
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
            fontSize: 150,
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