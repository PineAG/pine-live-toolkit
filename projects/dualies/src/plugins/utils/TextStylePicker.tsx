import { DStore, NumberField, propertyStore, Grid, FormItem, defaultValueStore, Select } from "@dualies/components"
import { SelectWithFilter } from "@dualies/components"
import { CSSProperties, useMemo } from "react"
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

function FontSelect(props: {valueStore: DStore<string | undefined>}) {
    const fontFamilies = useLoadedFontFamilies()
    const defaultFont = useMemo(() => getDefaultFontFamily(), [])
    const binding = defaultValueStore<string>(props.valueStore, defaultFont)
    return (<SelectWithFilter<string>
        placeholder="选择字体"
        valueStore={binding}
        options={fontFamilies.map(family => ({
            label: (
                <span style={{fontFamily: family}}>
                    {removeQuotes(family)}
                </span>
            ),
            value: family
        }))}
        />)
}

export function TextStylePicker(props: TextStylePickerProps) {
    const fontFamily = propertyStore(props.valueStore, "fontFamily")
    const borderWidth = propertyStore(props.valueStore, "borderWidth")
    const textColor = propertyStore(props.valueStore, "textColor")
    const borderColor = propertyStore(props.valueStore, "borderColor")

    return <Grid container style={{marginTop: "20px", marginBottom: "20px"}}>
        <Grid span={6}>
            <FormItem label="字体">
                <FontSelect valueStore={fontFamily}/>
            </FormItem>
        </Grid>
        <Grid span={6}>
            <FormItem label="边缘粗细">
                <NumberField
                    valueStore={borderWidth}
                    min={0}
                    step={0.25}
                />
            </FormItem>
        </Grid>
        <Grid span={6}>
            <FormItem label="文字颜色">
            <ColorPickerButton
                store={textColor}
            />
            </FormItem>
        </Grid>
        <Grid span={6}>
            <FormItem label="边缘颜色">
                <ColorPickerButton
                    store={borderColor}
                />
            </FormItem>
        </Grid>
    </Grid >
}

export default TextStylePicker
