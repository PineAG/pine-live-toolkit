import { DStore, NumberField, propertyStore, Grid, FormItem, defaultValueStore, Select, InlineForm } from "@dualies/components"
import { SelectWithFilter } from "@dualies/components"
import { CSSProperties, useMemo } from "react"
import { ColorPickerButton } from "./ColorPickerButton"

export interface TextStyle {
    fontFamily?: string,
    textColor: string,
    borderWidth: number,
    borderColor: string
}

export interface TextStyleAndSize extends TextStyle {
    fontSize: number
} 

export function convertTextStyleToCSS(textStyle: TextStyle & {fontSize?: number}): CSSProperties {
    return {
        color: textStyle.textColor,
        WebkitTextStrokeColor: textStyle.borderColor,
        WebkitTextStrokeWidth: textStyle.borderWidth,
        fontFamily: textStyle.fontFamily,
        fontSize: textStyle.fontSize
    }
}

export interface TextStylePickerProps<T extends TextStyle | TextStyleAndSize> {
    valueStore: DStore<T>
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

export function TextStylePicker(props: TextStylePickerProps<TextStyle>) {
    const fontFamily = propertyStore(props.valueStore, "fontFamily")
    const borderWidth = propertyStore(props.valueStore, "borderWidth")
    const textColor = propertyStore(props.valueStore, "textColor")
    const borderColor = propertyStore(props.valueStore, "borderColor")

    return <div style={{width: "100%"}}>
        <Grid container item span={12}>
            <Grid span={8}>
                <FormItem label="字体类型">
                    <FontSelect valueStore={fontFamily}/>
                </FormItem>
            </Grid>
        </Grid>
        <Grid item container span={12}>
            <Grid span={3}>
                <FormItem label="文字颜色">
                <ColorPickerButton
                    store={textColor}
                />
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
            <Grid span={3}>
                <FormItem label="边缘颜色">
                    <ColorPickerButton
                        store={borderColor}
                    />
                </FormItem>
            </Grid>
        </Grid>
    </div>
}

export function TextStyleAndSizePicker(props: TextStylePickerProps<TextStyleAndSize>) {
    const fontFamily = propertyStore(props.valueStore, "fontFamily")
    const borderWidth = propertyStore(props.valueStore, "borderWidth")
    const textColor = propertyStore(props.valueStore, "textColor")
    const borderColor = propertyStore(props.valueStore, "borderColor")
    const fontSize = propertyStore(props.valueStore, "fontSize")

    return <div style={{width: "100%"}}>
        <Grid container item span={12}>
            <Grid span={8}>
                <FormItem label="字体类型">
                    <FontSelect valueStore={fontFamily}/>
                </FormItem>
            </Grid>
            <Grid span={4}>
                <FormItem label="大小">
                    <NumberField
                        valueStore={fontSize}
                        min={1}
                        step={1}
                    />
                </FormItem>
            </Grid>
        </Grid>
        <Grid item container span={12}>
            <Grid span={3}>
                <FormItem label="文字颜色">
                <ColorPickerButton
                    store={textColor}
                />
                </FormItem>
            </Grid>
            <Grid span={1}><span></span></Grid>
            <Grid span={3}>
                <FormItem label="边缘颜色">
                    <ColorPickerButton
                        store={borderColor}
                    />
                </FormItem>
            </Grid>
            <Grid span={5}>
                <FormItem label="边缘粗细">
                    <NumberField
                        valueStore={borderWidth}
                        min={0}
                        step={0.25}
                    />
                </FormItem>
            </Grid>
        </Grid>
    </div>
}

