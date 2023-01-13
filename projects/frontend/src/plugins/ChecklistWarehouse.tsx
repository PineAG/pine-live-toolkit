import { arrayBinding, ButtonProps, DBinding, Flex, IconButton, Icons, IconSwitch, propertyBinding, QuickConfirm, StringField, useLocalDBinding } from "@pltk/components";
import { useInternalWarehouseConfig, WarehouseDefinition } from "../ui";


interface ChecklistItem {
    done: boolean
    show: boolean
    content: string
}

export interface ChecklistWarehouseConfig {
    items: ChecklistItem[]
}

function ChecklistPreview() {
    const config = useInternalWarehouseConfig<ChecklistWarehouseConfig>()
    return <Flex direction="vertical">
        {config.value.items.filter(it => it.show).map(it => (
            <div>{it.content}</div>
        ))}
    </Flex>
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

function ChecklistConfig() {
    const configBinding = useInternalWarehouseConfig<ChecklistWarehouseConfig>()
    const itemsBinding = arrayBinding(propertyBinding(configBinding, "items"))
    const newItemContentBinding = useLocalDBinding("")
    function createItem(){
        if(newItemContentBinding.value === "") return;
        const newItem: ChecklistItem = {
            content: newItemContentBinding.value,
            done: false,
            show: true
        }
        itemsBinding.insert(0, newItem)
        newItemContentBinding.update("")
    }
    return <Flex direction="vertical" nowrap spacing={16}>
        <Flex direction="horizontal" nowrap spacing={8}>
            <StringField binding={newItemContentBinding}/>
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
    </Flex>
}

export const ChecklistWarehouse: WarehouseDefinition<ChecklistWarehouseConfig> = {
    title: "待办清单",
    type: "builtin.checklist",
    initialize: {
        defaultConfig: () => ({
            items: []
        })
    },
    render: {
        preview: () => <ChecklistPreview/>,
        config: () => <ChecklistConfig/>
    }
}