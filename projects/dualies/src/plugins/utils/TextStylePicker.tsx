import { DStore, NumberField, propertyStore, Grid } from "@dualies/components"
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
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
        fontFamily: textStyle.fontFamily,
    }
}

export interface TextStylePickerProps {
    valueStore: DStore<TextStyle>
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
    
    const fontFamily = propertyStore(props.valueStore, "fontFamily")
    const borderWidth = propertyStore(props.valueStore, "borderWidth")
    const textColor = propertyStore(props.valueStore, "textColor")
    const borderColor = propertyStore(props.valueStore, "borderColor")


    return <Grid container style={{marginTop: "20px", marginBottom: "20px"}}>
        <Grid span={6}>
            <FormControl fullWidth>
                <InputLabel id="font-family-selector">字体</InputLabel>
                <Select 
                    labelId="font-family-selector"
                    value={fontFamily.value ?? defaultFontFamily} 
                    onChange={evt => {
                        fontFamily.update(evt.target.value)
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
        <Grid span={6}>
            <NumberField
                placeholder="边缘粗细"
                valueStore={borderWidth}
                min={0}
                step={0.25}
            />
        </Grid>
        <Grid span={6}>
            <ColorPickerButton
                label="文字颜色"
                store={textColor}
            />
        </Grid>
        <Grid span={6}>
            <ColorPickerButton
                label="边缘颜色"
                store={borderColor}
            />
        </Grid>
    </Grid>
}

export default TextStylePicker
