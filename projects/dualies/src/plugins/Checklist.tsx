import { Checkbox, IconButton, List, ListItem, ListItemButton, TextField, ListItemIcon, ListItemText } from "@mui/material";
import { Plugin, PropsWithConfig } from "./base";
import { getDefaultFontFamily, TextStyle, convertTextStyleToCSS, TextStylePicker } from "./utils";
import {Delete as DeleteIcon, Add as AddIcon} from "@mui/icons-material"
import { CSSProperties, useState } from "react";
import {arrayStore, createDStore, propertyStore, StringField, useLocalDStore, Collapse, NumberField, FormItem} from "@dualies/components"

export interface ChecklistItem {
    done: boolean
    content: string
}

export interface ChecklistConfig {
    fontSize: number
    textStyle: TextStyle
    items: ChecklistItem[]
}

function textStyle(done: boolean, config: ChecklistConfig): CSSProperties {
    if(done) {
        return {
            opacity: 0.5,
            textDecoration: "line-through",
            fontSize: config.fontSize,
            textDecorationColor: config.textStyle.borderColor,
            textDecorationStyle: "solid",
            textDecorationThickness: 0.1 * config.fontSize,
            ...convertTextStyleToCSS(config.textStyle)
        }
    } else {
        return {
            opacity: 1,
            fontSize: config.fontSize,
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
    return <List>
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
                    <AddIcon/>
                </IconButton>
            }
        >
            <StringField valueStore={newItemValueStore}/>
        </ListItem>
    </List>
}

export function ChecklistConfigPanel({configStore}: PropsWithConfig<ChecklistConfig>) {
    const newItemContentStore = useLocalDStore("")
    const itemsStore = arrayStore(propertyStore(configStore, "items"))
    const textStyle = propertyStore(configStore, "textStyle")
    const fontSize = propertyStore(configStore, "fontSize")

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
                <AddIcon/>
            </IconButton>
        }
    >
        <StringField valueStore={newItemContentStore}/>
    </ListItem>
    {itemsStore.items.map((item, i) => (
        <ListItem key={i} 
            secondaryAction={
                <IconButton edge="end" onClick={() => item.remove()}>
                    <DeleteIcon/>
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
        <TextStylePicker valueStore={textStyle}/>
        <FormItem label="字号">
            <NumberField
                valueStore={fontSize}
            />
        </FormItem>
    </Collapse>
    </>
}

export const ChecklistPlugin: Plugin<ChecklistConfig> = {
    title: "待办清单",
    type: "builtin.checklist",
    initialize: {
        defaultSize: () => ({width: 300, height: 600}),
        defaultConfig: () => ({
            fontSize: 45,
            textStyle: {
                borderColor: "black",
                borderWidth: 3,
                fontFamily: getDefaultFontFamily(),
                textColor: "white"
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
