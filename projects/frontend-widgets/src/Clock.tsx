import { convertTextStyleToCSS, TextStyleAndSize, TextStyleAndSizePicker } from "@pltk/components"
import moment from "moment"
import { useEffect, useState } from "react"
import { useWidgetConfigInternal, WidgetDefinition } from "@pltk/core"

import { FormItem, Grid, propertyBinding, StringField } from "@pltk/components"
import "@fontsource/baumans"

const DEFAULT_FONT = '"Baumans"'

interface ClockConfig {
    format: string
    textStyle: TextStyleAndSize
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


const Clock = () => {
    const configBinding = useWidgetConfigInternal<ClockConfig>()
    const date = useDate(configBinding.value.format)
    return <div style={{
            width: "100%",
            height: "100%",
            ...convertTextStyleToCSS(configBinding.value.textStyle)
        }}>
        {date}
    </div>
}

const ClockConfiguration = () => {
    const configBinding = useWidgetConfigInternal<ClockConfig>()
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
            <TextStyleAndSizePicker
                binding={textStyle}
            />
        </Grid>
        <Grid span={12}>
            <div style={{height: "100px"}}>
                <Clock/>
            </div>
        </Grid>
    </Grid>
}

function getDefaultTextStyle(): TextStyleAndSize{
    return {
        fontFamily: DEFAULT_FONT,
        borderColor: "#333333",
        borderWidth: 2.5,
        textColor: "white",
        alignment: "left",
        fontSize: 128
    }
}

const ClockPlugin: WidgetDefinition<ClockConfig> = {
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
        preview: () => <Clock/>,
        edit: () => <Clock/>,
        move: () => <Clock/>,
        config: () => <ClockConfiguration/>
    }
}

export default ClockPlugin