import { convertTextStyleToCSS, FormItem, Grid, MultiLinesStringField, propertyBinding, TextStyleAndSize, TextStyleAndSizePicker } from "@pltk/components"
import { WidgetDefinition, useWidgetConfigInternal } from "@pltk/core"

import "@fontsource/zcool-kuaile"

const DEFAULT_FONT = '"ZCOOL KuaiLe"'

export interface Config {
    content: string
    textStyle: TextStyleAndSize
}

function Text() {
    const configBinding = useWidgetConfigInternal<Config>()
    return <div style={{...convertTextStyleToCSS(configBinding.value.textStyle)}}>
        {configBinding.value.content}
    </div>
}

function TextConfig() {
    const configBinding = useWidgetConfigInternal<Config>()
    const contentStore = propertyBinding(configBinding, "content")
    const textStyle = propertyBinding(configBinding, "textStyle")

    return <Grid container>
        <Grid span={12}>
            <TextStyleAndSizePicker
                binding={textStyle}
            />
        </Grid>
        <Grid span={12}>
            <FormItem label="内容">
                <MultiLinesStringField
                    binding={contentStore}
                    rows={5}
                />
            </FormItem>
        </Grid>
        <Grid span={12}>
            <Text/>
        </Grid>
    </Grid>
}

export const TextPlugin: WidgetDefinition<Config> = {
    title: "文本信息",
    type: "builtin.textView",
    initialize: {
        defaultConfig: () => ({
            content: "新文本",
            textStyle: {
                fontFamily: DEFAULT_FONT,
                borderColor: "black",
                borderWidth: 2,
                textColor: "white",
                fontSize: 60,
                alignment: "left"
            }
        }),
        defaultSize: () => ({width: 300, height: 200})
    },
    render: {
        preview: () => <Text/>,
        move: () => <Text/>,
        edit: () => <Text/>,
        config: () => <TextConfig/>
    }
}

export default TextPlugin
