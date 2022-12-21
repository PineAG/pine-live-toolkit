import { Checkbox, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField } from "@mui/material";
import { Plugin, PropsWithConfig, PropsWithSetConfig } from "./base";
import { getDefaultFontFamily, TextStyle, convertTextStyleToCSS, TextStylePicker } from "./utils";
import {Delete as DeleteIcon, Add as AddIcon} from "@mui/icons-material"
import { CSSProperties, useState } from "react";

export interface ChecklistItem {
    done: boolean
    content: string
}

export interface ChecklistConfig {
    fontSize: number
    textStyle: TextStyle
    items: ChecklistItem[]
}

function textStyle(item: ChecklistItem, config: ChecklistConfig): CSSProperties {
    if(item.done) {
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
                <ListItemText style={textStyle(item, props.config)}>
                    <span style={textStyle(item, props.config)}>
                        {item.content}
                    </span>
                </ListItemText>
            </ListItem>
        ))}
    </List>
}

export function ChecklistEdit(props: PropsWithSetConfig<ChecklistConfig>) {
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
                    <span style={textStyle(item, props.config)}>
                        {item.content}
                    </span>
                </ListItemText>
            </ListItem>
        ))}
    </List>
}

export function ChecklistConfigPanel(props: PropsWithSetConfig<ChecklistConfig>) {
    const [newItemContent, setNewItemContent] = useState("")
    const updateItemAt = (i: number, updateItem: (item: ChecklistItem) => ChecklistItem) => () => {
        const prevItems = props.config.items.slice(0, i)
        const nextItems = props.config.items.slice(i+1, props.config.items.length)
        const target = props.config.items[i]
        const newTarget = updateItem(target)
        const newList = [...prevItems, newTarget, ...nextItems]
        console.log(newList)
        props.setConfig({...props.config, items: newList})
    }
    const deleteItemAt = (i: number) => () => {
        const prevItems = props.config.items.slice(0, i)
        const nextItems = props.config.items.slice(i+1, props.config.items.length)
        const newList = [...prevItems, ...nextItems]
        props.setConfig({...props.config, items: newList})
    }
    const updateDone = (item: ChecklistItem) => ({...item, done: !item.done})
    const updateContent = (newContent: string) => (item: ChecklistItem) => ({...item, content: newContent})
    function createItem(){
        if(newItemContent === "") return;
        const newItem: ChecklistItem = {
            content: newItemContent,
            done: false
        }
        const newList = [newItem, ...props.config.items]
        props.setConfig({...props.config, items: newList})
        setNewItemContent("")
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
        <TextField fullWidth variant="standard" value={newItemContent} onChange={evt => setNewItemContent(evt.target.value)}></TextField>
    </ListItem>
    {props.config.items.map((item, i) => (
        <ListItem key={i} 
            secondaryAction={
                <IconButton edge="end" onClick={deleteItemAt(i)}>
                    <DeleteIcon/>
                </IconButton>
            }>
            <ListItemButton onClick={updateItemAt(i, updateDone)}>
                <ListItemIcon>
                    <Checkbox
                        edge="start"
                        checked={item.done}
                    />
                </ListItemIcon>
            </ListItemButton>
            <TextField fullWidth variant="standard" 
                value={item.content} 
                onChange={evt => updateItemAt(i, updateContent(evt.target.value))()}
                ></TextField>
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
