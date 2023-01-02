import { DBinding, NumberField, propertyBinding, Grid, FormItem, defaultValueBinding, Select, InlineForm } from "@dualies/components"
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
    binding: DBinding<T>
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

function FontSelect(props: {binding: DBinding<string | undefined>}) {
    const fontFamilies = useLoadedFontFamilies()
    const defaultFont = useMemo(() => getDefaultFontFamily(), [])
    const binding = defaultValueBinding<string>(props.binding, defaultFont)
    return (<SelectWithFilter<string>
        placeholder="选择字体"
        binding={binding}
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
    const fontFamily = propertyBinding(props.binding, "fontFamily")
    const borderWidth = propertyBinding(props.binding, "borderWidth")
    const textColor = propertyBinding(props.binding, "textColor")
    const borderColor = propertyBinding(props.binding, "borderColor")

    return <div style={{width: "100%"}}>
        <Grid container item span={12}>
            <Grid span={8}>
                <FormItem label="字体类型">
                    <FontSelect binding={fontFamily}/>
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
                        binding={borderWidth}
                        min={0}
                        step={0.25}
                    />
                </FormItem>
            </Grid>
        </Grid>
    </div>
}

export function TextStyleAndSizePicker(props: TextStylePickerProps<TextStyleAndSize>) {
    const fontFamily = propertyBinding(props.binding, "fontFamily")
    const borderWidth = propertyBinding(props.binding, "borderWidth")
    const textColor = propertyBinding(props.binding, "textColor")
    const borderColor = propertyBinding(props.binding, "borderColor")
    const fontSize = propertyBinding(props.binding, "fontSize")

    return <div style={{width: "100%"}}>
        <Grid container item span={12}>
            <Grid span={8}>
                <FormItem label="字体类型">
                    <FontSelect binding={fontFamily}/>
                </FormItem>
            </Grid>
            <Grid span={4}>
                <FormItem label="大小">
                    <NumberField
                        binding={fontSize}
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
                        binding={borderWidth}
                        min={0}
                        step={0.25}
                    />
                </FormItem>
            </Grid>
        </Grid>
    </div>
}

