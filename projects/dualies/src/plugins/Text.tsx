import { MultiLinesStringField, NumberField, propertyStore } from "@dualies/components"
import { Stack } from "@mui/system"
import { Plugin, PropsWithConfig } from "./base"
import { convertTextStyleToCSS, getDefaultFontFamily, TextStyle, TextStylePicker } from "./utils"

export interface Config {
    content: string
    fontSize: number
    textStyle: TextStyle
}

function Text({configStore}: PropsWithConfig<Config>) {
    console.log(configStore)
    return <div style={{fontSize: configStore.value.fontSize, ...convertTextStyleToCSS(configStore.value.textStyle)}}>
        {configStore.value.content}
    </div>
}

function TextConfig(props: PropsWithConfig<Config>) {
    const contentStore = propertyStore(props.configStore, "content")
    const fontSize = propertyStore(props.configStore, "fontSize")
    const textStyle = propertyStore(props.configStore, "textStyle")

    return <Stack direction="column">
        <TextStylePicker
            valueStore={textStyle}
        />
        <NumberField
            placeholder="字号"
            min={1}
            valueStore={fontSize}
        />
        <MultiLinesStringField
            placeholder="内容"
            valueStore={contentStore}
            rows={5}
        />
        <Text {...props}/>
    </Stack>
}

export const TextPlugin: Plugin<Config> = {
    title: "文本信息",
    type: "builtin.textView",
    initialize: {
        defaultConfig: () => ({
            content: "新文本",
            fontSize: 60,
            textStyle: {
                fontFamily: getDefaultFontFamily(),
                borderColor: "black",
                borderWidth: 2,
                textColor: "white"
            }
        }),
        defaultSize: () => ({width: 300, height: 200})
    },
    render: {
        preview: configStore => <Text configStore={configStore}/>,
        move: configStore => <Text configStore={configStore}/>,
        edit: configStore => <Text configStore={configStore}/>,
        config: configStore => <TextConfig configStore={configStore}/>
    }
}

export default TextPlugin
