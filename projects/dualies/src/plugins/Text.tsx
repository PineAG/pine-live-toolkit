import { Grid, TextField } from "@mui/material"
import { Stack } from "@mui/system"
import {Plugin, PropsWithConfig, PropsWithSetConfig} from "./base"
import { convertTextStyleToCSS, getDefaultFontFamily, TextStyle, TextStylePicker } from "./utils"

export interface Config {
    content: string
    fontSize: number
    textStyle: TextStyle
}

function Text({config}: PropsWithConfig<Config>) {
    return <div style={{fontSize: config.fontSize, ...convertTextStyleToCSS(config.textStyle)}}>
        {config.content}
    </div>
}

function TextConfig({config, setConfig}: PropsWithSetConfig<Config>) {
    return <Stack direction="column">
        <TextStylePicker
            value={config.textStyle}
            onChange={textStyle => setConfig({...config, textStyle})}
        />
        <TextField
            value={config.fontSize}
            type="number"
            onChange={evt => setConfig({...config, fontSize: parseInt(evt.target.value ?? "1")})}
            InputProps={{inputProps: {min: 1}}}
        />
        <TextField
            label="内容"
            value={config.content}
            multiline
            rows={5}
            fullWidth
            onChange={evt => setConfig({...config, content: evt.currentTarget.value})}
        />
        <Text config={config}/>
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
        preview: config => <Text config={config}/>,
        move: config => <Text config={config}/>,
        config: (config, setConfig) => <TextConfig config={config} setConfig={setConfig}/>
    }
}

export default TextPlugin
