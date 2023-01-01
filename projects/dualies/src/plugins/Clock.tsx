import {useState, useEffect, useRef} from "react"
import { Plugin, PropsWithSetConfig } from "./base"
import moment from "moment"
import { Grid, Stack, TextField } from "@mui/material"
import { TextStylePicker, getDefaultFontFamily, TextStyle, convertTextStyleToCSS } from "./utils"

import "@fontsource/baumans"

const DEFAULT_FONT = '"Baumans"'

interface ClockConfig {
    format: string
    textStyle: TextStyle
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
            ...convertTextStyleToCSS(props.config.textStyle)
        }}>
        {date}
    </div>
}

const ClockConfiguration = ({config, setConfig}: PropsWithSetConfig<ClockConfig>) => {
    return <Stack direction="column">
        <TextField
            label="时间格式"
            value={config.format}
            onChange={evt => setConfig({...config, format: evt.target.value})}
        />
        <TextStylePicker
            value={config.textStyle}
            onChange={(textStyle) => {
                setConfig({...config, textStyle})
            }}
        />
        <div style={{height: "100px"}}>
            <Clock config={config}/>
        </div>
    </Stack>
}

function getDefaultTextStyle(): TextStyle{
    return {
        fontFamily: DEFAULT_FONT,
        borderColor: "#333333",
        borderWidth: 2.5,
        textColor: "white",
    }
}

const ClockPlugin: Plugin<ClockConfig> = {
    title: "时钟",
    type: "builtin.clock",
    initialize: {
        defaultConfig: () => ({
            format: "HH:mm",
            textStyle: getDefaultTextStyle()
        }),
        defaultSize: () => ({width: 300, height: 150})
    },
    render: {
        preview: (conf) => <Clock config={conf}/>,
        edit: (conf) => <Clock config={conf}/>,
        move: (conf) => <Clock config={conf}/>,
        config: (config, setConfig) => <ClockConfiguration {...{config, setConfig}}/>
    }
}

export default ClockPlugin