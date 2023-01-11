import { convertTextStyleToCSS, FormItem, Grid, MultiLinesStringField, propertyBinding, TextStyleAndSize, TextStyleAndSizePicker } from "@pltk/components"
import { Plugin, PropsWithConfig } from "../ui"

import "@fontsource/zcool-kuaile"

const DEFAULT_FONT = '"ZCOOL KuaiLe"'

export interface Config {
    content: string
    textStyle: TextStyleAndSize
}

function Text({configBinding: configBinding}: PropsWithConfig<Config>) {
    return <div style={{...convertTextStyleToCSS(configBinding.value.textStyle)}}>
        {configBinding.value.content}
    </div>
}

function TextConfig(props: PropsWithConfig<Config>) {
    const contentStore = propertyBinding(props.configBinding, "content")
    const textStyle = propertyBinding(props.configBinding, "textStyle")

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
            <Text {...props}/>
        </Grid>
    </Grid>
}

export const TextPlugin: Plugin<Config> = {
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
        preview: configBinding => <Text configBinding={configBinding}/>,
        move: configBinding => <Text configBinding={configBinding}/>,
        edit: configBinding => <Text configBinding={configBinding}/>,
        config: configBinding => <TextConfig configBinding={configBinding}/>
    }
}

export default TextPlugin
