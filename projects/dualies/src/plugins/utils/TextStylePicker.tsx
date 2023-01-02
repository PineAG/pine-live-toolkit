import { DBinding, NumberField, propertyBinding, Grid, FormItem, defaultValueBinding, Select, InlineForm, mapBinding } from "@dualies/components"
import { SelectWithFilter } from "@dualies/components"
import { CSSProperties, useMemo } from "react"
import { ColorPickerButton } from "./ColorPickerButton"

export interface TextStyle {
    fontFamily?: string,
    textColor: string,
    borderWidth: number,
    borderColor: string,
    alignment: "left" | "right" | "center"
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
        fontSize: textStyle.fontSize,
        textAlign: textStyle.alignment
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

function SharedTextEdit(props: TextStylePickerProps<TextStyle>) {
    return <>
        <Grid container span={12}>
            <Grid span={3}>
                <FormItem label="文字颜色">
                <ColorPickerButton
                    store={propertyBinding(props.binding, "textColor")}
                />
                </FormItem>
            </Grid>
            <Grid span={1}><span></span></Grid>
            <Grid span={3}>
                <FormItem label="边缘颜色">
                    <ColorPickerButton
                        store={propertyBinding(props.binding, "borderColor")}
                    />
                </FormItem>
            </Grid>
            <Grid span={5}>
                <FormItem label="边缘粗细">
                    <NumberField
                        binding={propertyBinding(props.binding, "borderWidth")}
                        min={0}
                        step={0.25}
                    />
                </FormItem>
            </Grid>
        </Grid>
        <Grid container span={12}>
            <Grid span={8}>
                <FormItem label="对齐方式">
                    <Select<TextStyle["alignment"]> binding={propertyBinding(props.binding, "alignment")} options={[
                        {value: "left", label: "左对齐"},
                        {value: "right", label: "右对齐"},
                        {value: "center", label: "居中对齐"},
                    ]}/>
                </FormItem>
            </Grid>
        </Grid>
    </>
}

export function TextStylePicker(props: TextStylePickerProps<TextStyle>) {
    return <Grid container>
        <Grid container span={12}>
            <Grid span={8}>
                <FormItem label="字体类型">
                    <FontSelect binding={propertyBinding(props.binding, "fontFamily")}/>
                </FormItem>
            </Grid>
        </Grid>
        <SharedTextEdit binding={props.binding}/>
    </Grid>
}

export function TextStyleAndSizePicker(props: TextStylePickerProps<TextStyleAndSize>) {
    const fontFamily = propertyBinding(props.binding, "fontFamily")
    const fontSize = propertyBinding(props.binding, "fontSize")

    const sharedBinding = mapBinding(props.binding, {
        forward: ({fontSize, ...rest}) => rest,
        backward: (value, {fontSize}) => ({fontSize, ...value})
    })

    return <Grid container>
        <Grid container span={12}>
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
        <SharedTextEdit binding={sharedBinding}/>
    </Grid>
}

