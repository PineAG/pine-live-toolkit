import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import {CSSProperties, useMemo} from "react"
import { ColorPickerButton } from "./ColorPickerButton"

export interface TextStyle {
    fontFamily?: string,
    textColor: string,
    borderWidth: number,
    borderColor: string
}

export function convertTextStyleToCSS(textStyle: TextStyle): CSSProperties {
    return {
        color: textStyle.textColor,
        WebkitTextStrokeColor: textStyle.borderColor,
        WebkitTextStrokeWidth: textStyle.borderWidth,
        fontFamily: textStyle.fontFamily
    }
}

export interface TextStylePickerProps {
    value: TextStyle
    onChange: (style: TextStyle) => void
}

export function getFontsList(): string[] {
    const fontFamilies = new Set<string>()
    fontFamilies.add("\"Arial\"")
    document.fonts.forEach(f => fontFamilies.add(f.family))
    const list = Array.from(fontFamilies)
    list.sort()
    return list
}

export function getDefaultFontFamily(): string {
    return getFontsList()[0]
}

function useLoadedFontFamilies(): string[] {
    return useMemo(() => getFontsList(), [])
}

function removeQuotes(s: string): string {
    return s.replace(/^"/, "").replace(/"$/, "")
}

export function TextStylePicker(props: TextStylePickerProps) {
    const fontFamilies = useLoadedFontFamilies()
    const defaultFontFamily = useMemo(() => getDefaultFontFamily(), [])
    function patchConfig<K extends keyof TextStyle>(key: K, value: TextStyle[K]) {
        props.onChange({...props.value, [key]: value})
    }
    return <Grid container style={{marginTop: "20px", marginBottom: "20px"}}>
        <Grid xs={6}>
            <FormControl fullWidth>
                <InputLabel id="font-family-selector">字体</InputLabel>
                <Select 
                    labelId="font-family-selector"
                    value={props.value.fontFamily ?? defaultFontFamily} 
                    onChange={evt => {
                        patchConfig("fontFamily", evt.target.value)
                    }}>
                    {fontFamilies.map((font) => (
                        <MenuItem value={font} key={font}>
                            <span style={{fontFamily: font}}>
                                {removeQuotes(font)}
                            </span>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
        <Grid xs={6}>
            <TextField
                fullWidth
                label="边缘粗细"
                value={props.value.borderWidth}
                type="number"
                onChange={evt => patchConfig("borderWidth", parseFloat(evt.target.value ?? "0"))}
                InputProps={{
                    inputProps: { 
                        min: 0,
                        step: 0.25
                    }
                }}
            />
        </Grid>
        <Grid xs={6}>
            <ColorPickerButton
                label="文字颜色"
                color={props.value.textColor}
                onChange={(newColor) => patchConfig("textColor", newColor)}
            />
        </Grid>
        <Grid xs={6}>
            <ColorPickerButton
                label="边缘颜色"
                color={props.value.borderColor}
                onChange={(newColor) => patchConfig("borderColor", newColor)}
            />
        </Grid>
    </Grid>
}

export default TextStylePicker
