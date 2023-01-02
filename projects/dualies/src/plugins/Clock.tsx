import moment from "moment"
import { useEffect, useRef, useState } from "react"
import { Plugin, PropsWithConfig } from "./base"
import { convertTextStyleToCSS, TextStyle, TextStylePicker } from "./utils"

import { FormItem, Grid, propertyBinding, StringField } from "@dualies/components"
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
            ...convertTextStyleToCSS(configStore.value.textStyle),
            fontSize: fontSize * 0.8,
        }}>
        {date}
    </div>
}

const ClockConfiguration = ({configStore}: PropsWithConfig<ClockConfig>) => {
    const format = propertyBinding(configStore, "format")
    const textStyle = propertyBinding(configStore, "textStyle")
    return <Grid container>
        <Grid span={12}>
            <FormItem label="时间格式">
                <StringField
                    binding={format}
                />
            </FormItem>
        </Grid>
        <Grid span={12}>
            <TextStylePicker
                binding={textStyle}
            />
        </Grid>
        <Grid span={12}>
            <div style={{height: "100px"}}>
                <Clock configStore={configStore}/>
            </div>
        </Grid>
    </Grid>
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