import { Icons, arrayStore, Collapse, FormItem, NumberField, propertyStore, StringField, useLocalDStore } from "@dualies/components";
import { Checkbox, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { CSSProperties } from "react";
import { Plugin, PropsWithConfig } from "./base";
import { convertTextStyleToCSS, TextStyleAndSize, TextStyleAndSizePicker } from "./utils";

import "@fontsource/zcool-kuaile";

const DEFAULT_FONT = '"ZCOOL KuaiLe"'

export interface ChecklistItem {
    done: boolean
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
            ...convertTextStyleToCSS(config.textStyle)
        }
    } else {
        return {
            opacity: 1,
            ...convertTextStyleToCSS(config.textStyle)
        }
    }
}

export function ChecklistPreview({configStore}: PropsWithConfig<ChecklistConfig>) {
    const itemsStore = arrayStore(propertyStore(configStore, "items"))
    return <List>
        {itemsStore.value.map((item, i) => (
            <ListItem key={i}>
                <ListItemText style={textStyle(item.done, configStore.value)}>
                    <span style={textStyle(item.done, configStore.value)}>
                        {item.content}
                    </span>
                </ListItemText>
            </ListItem>
        ))}
    </List>
}

export function ChecklistEdit({configStore}: PropsWithConfig<ChecklistConfig>) {
    const config = configStore.value
    const newItemValueStore = useLocalDStore("")
    const itemsStore = arrayStore(propertyStore(configStore, "items"))
    return (<List>
        {itemsStore.items.map((item, i) => (
            <ListItem key={i}
                secondaryAction={
                <Checkbox
                    edge="start"
                    checked={item.value.done}
                    onChange={() => propertyStore(item, "done").update(!item.value.done)}
                    />}>
                <ListItemText>
                    <span style={textStyle(item.value.done, config)}>
                        {item.value.content}
                    </span>
                </ListItemText>
            </ListItem>
        ))}
        <ListItem
            secondaryAction={
                <IconButton edge="end" onClick={async () => {
                    await itemsStore.append({done: false, content: newItemValueStore.value})
                    newItemValueStore.update("")
                    }}>
                    <Icons.Add/>
                </IconButton>
            }
        >
            <StringField valueStore={newItemValueStore}/>
        </ListItem>
    </List>)
}

export function ChecklistConfigPanel({configStore}: PropsWithConfig<ChecklistConfig>) {
    const newItemContentStore = useLocalDStore("")
    const itemsStore = arrayStore(propertyStore(configStore, "items"))
    const textStyle = propertyStore(configStore, "textStyle")

    function createItem(){
        if(newItemContentStore.value === "") return;
        const newItem: ChecklistItem = {
            content: newItemContentStore.value,
            done: false
        }
        itemsStore.insert(0, newItem)
        newItemContentStore.update("")
    }
    return <>
    <List>
    <ListItem
        secondaryAction={
            <IconButton edge="end" onClick={createItem}>
                <Icons.Add/>
            </IconButton>
        }
    >
        <StringField valueStore={newItemContentStore}/>
    </ListItem>
    {itemsStore.items.map((item, i) => (
        <ListItem key={i} 
            secondaryAction={
                <IconButton edge="end" onClick={() => item.remove()}>
                    <Icons.Delete/>
                </IconButton>
            }>
            <ListItemButton onClick={() => propertyStore(item, "done").update(!item.value.done)}>
                <ListItemIcon>
                    <Checkbox
                        edge="start"
                        checked={item.value.done}
                    />
                </ListItemIcon>
            </ListItemButton>
            <StringField valueStore={propertyStore(item, "content")}/>
        </ListItem>
    ))}
    </List>
    <Collapse title="字体设置">
        <TextStyleAndSizePicker valueStore={textStyle}/>
    </Collapse>
    </>
}

export const ChecklistPlugin: Plugin<ChecklistConfig> = {
    title: "待办清单",
    type: "builtin.checklist",
    initialize: {
        defaultSize: () => ({width: 300, height: 600}),
        defaultConfig: () => ({
            textStyle: {
                borderColor: "#333333",
                borderWidth: 2,
                fontFamily: DEFAULT_FONT,
                textColor: "white",
                fontSize: 45,
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
