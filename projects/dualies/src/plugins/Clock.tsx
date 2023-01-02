import { Stack } from "@mui/material"
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import { Plugin, PropsWithConfig } from "./base"
import { convertTextStyleToCSS, TextStyle, TextStylePicker } from "./utils"

import { propertyStore, StringField } from "@dualies/components"
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


const Clock = ({configStore}: PropsWithConfig<ClockConfig>) => {
    const ref = useRef<HTMLDivElement>(null)
    const date = useDate(configStore.value.format)
    const [fontSize, setFontSize] = useState<number>(100)
    useEffect(() => {
        setFontSize(ref.current?.clientHeight ?? 100)
    }, [ref.current?.clientHeight])
    return <div ref={ref} style={{
            width: "100%",
            height: "100%",
            fontSize: fontSize * 0.8, 
            ...convertTextStyleToCSS(configStore.value.textStyle)
        }}>
        {date}
    </div>
}

const ClockConfiguration = ({configStore}: PropsWithConfig<ClockConfig>) => {
    const format = propertyStore(configStore, "format")
    const textStyle = propertyStore(configStore, "textStyle")
    return <Stack direction="column">
        <StringField
            placeholder="时间格式"
            valueStore={format}
        />
        <TextStylePicker
            valueStore={textStyle}
        />
        <div style={{height: "100px"}}>
            <Clock configStore={configStore}/>
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
        preview: (configStore) => <Clock configStore={configStore}/>,
        edit: (configStore) => <Clock configStore={configStore}/>,
        move: (configStore) => <Clock configStore={configStore}/>,
        config: (configStore) => <ClockConfiguration configStore={configStore}/>
    }
}

export default ClockPlugin