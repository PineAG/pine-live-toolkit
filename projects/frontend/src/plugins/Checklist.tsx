import { arrayBinding, ButtonProps, Collapse, convertTextStyleToCSS, DBinding, Flex, Grid, IconButton, Icons, IconSwitch, propertyBinding, StringField, TextStyleAndSize, TextStyleAndSizePicker, useLocalDBinding } from "@pltk/components";
import { CSSProperties } from "react";
import { WidgetDefinition, WarehouseConsumer, WarehouseEditor, WarehouseProvider, WarehouseSelect, useWidgetConfigInternal } from "../ui";

import "@fontsource/zcool-kuaile";
import { ChecklistWarehouse } from "./ChecklistWarehouse";

const DEFAULT_FONT = '"ZCOOL KuaiLe"'

export interface ChecklistConfig {
    textStyle: TextStyleAndSize
    warehouseId: number | null
}

function textStyle(done: boolean, textStyle: TextStyleAndSize): CSSProperties {
    if(done) {
        return {
            opacity: 0.5,
            textDecoration: "line-through",
            textDecorationColor: textStyle.borderColor,
            textDecorationStyle: "solid",
            textDecorationThickness: 0.1 * textStyle.fontSize,
            width: "100%",
            height: "100%",
            ...convertTextStyleToCSS(textStyle)
        }
    } else {
        return {
            opacity: 1,
            width: "100%",
            height: "100%",
            ...convertTextStyleToCSS(textStyle)
        }
    }
}

export function ChecklistPreview() {
    const configBinding = useWidgetConfigInternal<ChecklistConfig>()
    return <WarehouseProvider warehouse={ChecklistWarehouse} binding={propertyBinding(configBinding, "warehouseId")}>
        <WarehouseConsumer warehouse={ChecklistWarehouse}>
            {(meta, config) => {
                const itemsBinding = arrayBinding(propertyBinding(config, "items"))
                return (<Grid container spacing={0}>
                    {itemsBinding.value.filter(it => it.show).map((item, i) => (
                        <Grid span={12} key={i}>
                            <div style={textStyle(item.done, configBinding.value.textStyle)}>
                                {item.content}
                            </div>
                        </Grid>
                    ))}
                </Grid>)
            }}
        </WarehouseConsumer>
    </WarehouseProvider>
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

export function ChecklistEdit() {
    const configBinding = useWidgetConfigInternal<ChecklistConfig>()
    const newItemBinding = useLocalDBinding("")
    const warehouseIdBinding = propertyBinding(configBinding, "warehouseId")
    return (<WarehouseProvider binding={warehouseIdBinding} warehouse={ChecklistWarehouse}>
            <WarehouseConsumer warehouse={ChecklistWarehouse}>
                {(meta, config) => {
                    const itemsBinding = arrayBinding(propertyBinding(config, "items"))
                    return <Flex direction="vertical" nowrap>
                        {itemsBinding.items.map(item => (
                            <Flex direction="horizontal" alignment="space-between" nowrap>
                                <div style={textStyle(item.value.done, configBinding.value.textStyle)}>
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
                    </Flex>
                }}
            </WarehouseConsumer>
        </WarehouseProvider>)
}

export function ChecklistConfigPanel() {
    const configBinding = useWidgetConfigInternal<ChecklistConfig>()
    const textStyle = propertyBinding(configBinding, "textStyle")
    const warehouseIdBinding = propertyBinding(configBinding, "warehouseId")

    return <Flex direction="vertical" nowrap spacing={8}>
        <WarehouseProvider binding={warehouseIdBinding} warehouse={ChecklistWarehouse}>
            <WarehouseSelect/>
            <WarehouseEditor/>
        </WarehouseProvider>
        <Collapse title="字体设置">
            <TextStyleAndSizePicker binding={textStyle}/>
        </Collapse>
    </Flex>
}

export const ChecklistPlugin: WidgetDefinition<ChecklistConfig> = {
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
            warehouseId: null
        })
    },
    render: {
        edit: () => <ChecklistEdit/>,
        preview: () => <ChecklistPreview/>,
        move: () => <ChecklistPreview/>,
        config: () => <ChecklistConfigPanel/>
    }
}

export default ChecklistPlugin
