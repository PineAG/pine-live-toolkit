import { arrayBinding, ButtonProps, Collapse, convertTextStyleToCSS, DBinding, Flex, Grid, IconButton, Icons, IconSwitch, propertyBinding, QuickConfirm, StringField, TextStyleAndSize, TextStyleAndSizePicker, useLocalDBinding } from "@dualies/components";
import { CSSProperties } from "react";
import { Plugin, PropsWithConfig } from "../ui";

import "@fontsource/zcool-kuaile";

const DEFAULT_FONT = '"ZCOOL KuaiLe"'

export interface ChecklistItem {
    done: boolean
    show: boolean
    content: string
}

export interface ChecklistConfig {
    textStyle: TextStyleAndSize
    items: ChecklistItem[]
}

function textStyle(done: boolean, config: ChecklistConfig): CSSProperties {
    if(done) {
        return {
            opacity: 0.5,
            textDecoration: "line-through",
            textDecorationColor: config.textStyle.borderColor,
            textDecorationStyle: "solid",
            textDecorationThickness: 0.1 * config.textStyle.fontSize,
            width: "100%",
            height: "100%",
            ...convertTextStyleToCSS(config.textStyle)
        }
    } else {
        return {
            opacity: 1,
            width: "100%",
            height: "100%",
            ...convertTextStyleToCSS(config.textStyle)
        }
    }
}

export function ChecklistPreview({configStore}: PropsWithConfig<ChecklistConfig>) {
    const itemsBinding = arrayBinding(propertyBinding(configStore, "items"))
    return <Grid container spacing={0}>
        {itemsBinding.value.filter(it => it.show).map((item, i) => (
            <Grid span={12} key={i}>
                <div style={textStyle(item.done, configStore.value)}>
                    {item.content}
                </div>
            </Grid>
        ))}
    </Grid>
}

interface ChecklistIconButtonProps {
    binding: DBinding<boolean>
    size?: ButtonProps["size"]
}

function ChecklistDoneButton(props: ChecklistIconButtonProps) {
    return <IconSwitch
        binding={props.binding}
        size={props.size}
        enabledIcon={<Icons.Completed/>}
        disabledIcon={<Icons.Pending/>}
    />
}

function ChecklistVisibleButton(props: ChecklistIconButtonProps) {
    return <IconSwitch
        binding={props.binding}
        size={props.size}
        enabledIcon={<Icons.Show/>}
        disabledIcon={<Icons.Hide/>}
    />
}

export function ChecklistEdit({configStore}: PropsWithConfig<ChecklistConfig>) {
    const config = configStore.value
    const newItemBinding = useLocalDBinding("")
    const itemsBinding = arrayBinding(propertyBinding(configStore, "items"))
    return (<Flex direction="vertical" nowrap>
        {itemsBinding.items.filter(it => it.value.show).map((item, i) => (
            <Flex direction="horizontal" alignment="space-between" nowrap>
                <div style={textStyle(item.value.done, config)}>
                    {item.value.content}
                </div>
                <ChecklistDoneButton binding={propertyBinding(item, "done")} size="large"/>
            </Flex>
        ))}
        <Flex direction="horizontal" alignment="space-between" nowrap>
            <StringField binding={newItemBinding}/>
            <IconButton onClick={async () => {
                    if(newItemBinding.value === "") return;
                    await itemsBinding.append({done: false, content: newItemBinding.value, show: true})
                    newItemBinding.update("")
                }}
                icon={<Icons.Add/>}
                />
        </Flex>
    </Flex>)
}

export function ChecklistConfigPanel({configStore}: PropsWithConfig<ChecklistConfig>) {
    const newItemContentStore = useLocalDBinding("")
    const itemsBinding = arrayBinding(propertyBinding(configStore, "items"))
    const textStyle = propertyBinding(configStore, "textStyle")

    function createItem(){
        if(newItemContentStore.value === "") return;
        const newItem: ChecklistItem = {
            content: newItemContentStore.value,
            done: false,
            show: true
        }
        itemsBinding.insert(0, newItem)
        newItemContentStore.update("")
    }
    return <Flex direction="vertical" nowrap spacing={16}>
    <Flex direction="horizontal" nowrap spacing={8}>
        <StringField binding={newItemContentStore}/>
        <IconButton onClick={createItem}>
            <Icons.Add/>
        </IconButton>
    </Flex>
    {itemsBinding.items.map((item, i) => (
        <Flex direction="horizontal" nowrap style={{width: "100%"}} spacing={8}>
            <ChecklistDoneButton binding={propertyBinding(item, "done")}/>
            <ChecklistVisibleButton binding={propertyBinding(item, "show")}/>
            <StringField binding={propertyBinding(item, "content")}/>
            <IconButton icon={<Icons.Up/>} disabled={i === 0} onClick={() => item.move(i-1)}/>
            <IconButton icon={<Icons.Down/>} disabled={i === itemsBinding.value.length - 1} onClick={() => item.move(i+1)}/>
            <QuickConfirm title="确认要删除吗" description="之后无法恢复" onConfirm={() => item.remove()}>
                <IconButton>
                    <Icons.Delete/>
                </IconButton>
            </QuickConfirm>
        </Flex>
    ))}
    <Collapse title="字体设置">
        <TextStyleAndSizePicker binding={textStyle}/>
    </Collapse>
    </Flex>
}

export const ChecklistPlugin: Plugin<ChecklistConfig> = {
    title: "待办清单",
    type: "builtin.checklist",
    initialize: {
        defaultSize: () => ({width: 300, height: 600}),
        defaultConfig: () => ({
            textStyle: {
                borderColor: "#333333",
                borderWidth: 1.25,
                fontFamily: DEFAULT_FONT,
                textColor: "white",
                fontSize: 35,
                alignment: "left"
            },
            items: []
        })
    },
    render: {
        edit: (configStore) => <ChecklistEdit configStore={configStore}/>,
        preview: (configStore) => <ChecklistPreview configStore={configStore}/>,
        move: (configStore) => <ChecklistPreview configStore={configStore}/>,
        config: (configStore) => <ChecklistConfigPanel configStore={configStore}/>
    }
}

export default ChecklistPlugin
