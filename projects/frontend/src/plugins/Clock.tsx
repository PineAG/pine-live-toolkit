import { convertTextStyleToCSS, TextStyle, TextStylePicker } from "@pltk/components"
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import { Plugin, PropsWithConfig } from "../ui"

import { FormItem, Grid, propertyBinding, StringField } from "@pltk/components"
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


const Clock = ({configBinding: configBinding}: PropsWithConfig<ClockConfig>) => {
    const ref = useRef<HTMLDivElement>(null)
    const date = useDate(configBinding.value.format)
    const [fontSize, setFontSize] = useState<number>(100)
    useEffect(() => {
        setFontSize(ref.current?.clientHeight ?? 100)
    }, [ref.current?.clientHeight])
    return <div ref={ref} style={{
            width: "100%",
            height: "100%",
            ...convertTextStyleToCSS(configBinding.value.textStyle),
            fontSize: fontSize * 0.8,
        }}>
        {date}
    </div>
}

const ClockConfiguration = ({configBinding: configBinding}: PropsWithConfig<ClockConfig>) => {
    const format = propertyBinding(configBinding, "format")
    const textStyle = propertyBinding(configBinding, "textStyle")
    return <Grid container alignment="left">
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
                <Clock configBinding={configBinding}/>
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
        alignment: "left"
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
        preview: (configBinding) => <Clock configBinding={configBinding}/>,
        edit: (configBinding) => <Clock configBinding={configBinding}/>,
        move: (configBinding) => <Clock configBinding={configBinding}/>,
        config: (configBinding) => <ClockConfiguration configBinding={configBinding}/>
    }
}

export default ClockPlugin