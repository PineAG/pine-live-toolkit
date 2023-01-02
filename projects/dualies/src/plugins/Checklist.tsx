import { Checkbox, IconButton, List, ListItem, ListItemButton, TextField, ListItemIcon, ListItemText } from "@mui/material";
import { Plugin, PropsWithConfig, PropsWithSetConfig } from "./base";
import { getDefaultFontFamily, TextStyle, convertTextStyleToCSS, TextStylePicker } from "./utils";
import {Delete as DeleteIcon, Add as AddIcon} from "@mui/icons-material"
import { CSSProperties, useState } from "react";
import {arrayStore, createDStore, propertyStore, StringField, useLocalDStore} from "@dualies/components"

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

export function ChecklistPreview(props: PropsWithConfig<ChecklistConfig>) {
    return <List>
        {props.config.items.map((item, i) => (
            <ListItem key={i}>
                <ListItemText style={textStyle(item.done, props.config)}>
                    <span style={textStyle(item.done, props.config)}>
                        {item.content}
                    </span>
                </ListItemText>
            </ListItem>
        ))}
    </List>
}

export function ChecklistEdit(props: PropsWithSetConfig<ChecklistConfig>) {
    const newItemValueStore = useLocalDStore("")
    function updateChecklistDone(i: number) {
        const prevItems = props.config.items.slice(0, i)
        const nextItems = props.config.items.slice(i+1, props.config.items.length)
        const {content, done} = props.config.items[i]
        const newTarget = {content, done: !done}
        const newList = [...prevItems, newTarget, ...nextItems]
        props.setConfig({...props.config, items: newList})
    }
    return <List>
        {props.config.items.map((item, i) => (
            <ListItem key={i}
                secondaryAction={
                <Checkbox
                    edge="start"
                    checked={item.done}
                    onChange={() => updateChecklistDone(i)}
                    />}>
                <ListItemText>
                    <span style={textStyle(item.done, props.config)}>
                        {item.content}
                    </span>
                </ListItemText>
            </ListItem>
        ))}
        <ListItem
            secondaryAction={
                <IconButton edge="end" onClick={async () => {
                    props.setConfig({
                        ...props.config,
                        items: [
                            ...props.config.items,
                            {
                                content: newItemValueStore.value,
                                done: false
                            }
                        ]
                    })
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

export function ChecklistConfigPanel(props: PropsWithSetConfig<ChecklistConfig>) {
    const newItemContentStore = useLocalDStore("")
    const configStore = createDStore({value: props.config, update: props.setConfig})
    const itemsStore = arrayStore(propertyStore(configStore, "items"))

    function createItem(){
        if(newItemContentStore.value === "") return;
        const newItem: ChecklistItem = {
            content: newItemContentStore.value,
            done: false
        }
        const newList = [newItem, ...props.config.items]
        props.setConfig({...props.config, items: newList})
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
    <TextStylePicker
        value={props.config.textStyle}
        onChange={(textStyle) => {
            props.setConfig({...props.config, textStyle})
        }}
    />
    <TextField
            label="字号"
            value={props.config.fontSize}
            type="number"
            onChange={evt => props.setConfig({...props.config, fontSize: parseInt(evt.target.value ?? "1")})}
            InputProps={{inputProps: {min: 1}}}
        />
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
        edit: (config, setConfig) => <ChecklistEdit config={config} setConfig={setConfig}/>,
        preview: (config) => <ChecklistPreview config={config}/>,
        move: (config) => <ChecklistPreview config={config}/>,
        config: (config, setConfig) => <ChecklistConfigPanel config={config} setConfig={setConfig}/>
    }
}

export default ChecklistPlugin
