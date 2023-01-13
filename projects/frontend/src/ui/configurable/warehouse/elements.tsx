import { ActionButton, BasicEmpty, CardWithActions, DBinding, Divider, Flex, FormItem, HStack, LiteDangerButton, propertyBinding, QuickConfirm, Select, SimpleCard, StringField, Tooltip, useLocalDBinding, useTemporaryBinding } from "@pltk/components";
import { IWarehouseMeta } from "@pltk/protocol";
import { useLiveToolkitClient, useWarehouseConfigBinding, useWarehouseList, useWarehouseMetaBinding } from "../../backend";
import { createNullableContext, useNullableContext } from "../../backend/hooks/utils";
import { unwrapAsyncBinding, unwrapAsyncSubs, useAsyncTemporaryBinding } from "../../components/subs";
import { WarehouseObject } from "./base";

export interface WarehouseProviderProps<C> {
    warehouse: WarehouseObject<C>
    binding: DBinding<number | null>
    children: any
}

const WarehouseDefinitionContext = createNullableContext<WarehouseObject<any>>("Warehouse* components are only available within a WarehouseProvider")
const WarehouseIdBindingContext = createNullableContext<DBinding<null | number>>("Warehouse* components are only available within a WarehouseProvider")

export function WarehouseProvider<C>(props: WarehouseProviderProps<C>) {
    return <WarehouseDefinitionContext.Provider value={props.warehouse}>
        <WarehouseIdBindingContext.Provider value={props.binding}>
            {props.children}
        </WarehouseIdBindingContext.Provider>
    </WarehouseDefinitionContext.Provider>
}

export function WarehousePreview() {
    const idBinding = useNullableContext(WarehouseIdBindingContext)
    if(idBinding.value === null) {
        return <BasicEmpty/>
    } else {
        return <WarehousePreviewInternal warehouseId={idBinding.value}/>
    }
}

function WarehousePreviewInternal({warehouseId}: {warehouseId: number}) {
    const warehouseDef = useNullableContext(WarehouseDefinitionContext)
    const metaReq = useWarehouseMetaBinding(warehouseDef.type, warehouseId)
    const configReq = useWarehouseConfigBinding(warehouseDef.type, warehouseId)
    return unwrapAsyncBinding(metaReq, metaBinding => {
        return unwrapAsyncBinding(configReq, configBinding => {
            return <SimpleCard>
                <WarehouseMetaInternalProviderContext.Provider value={metaBinding}>
                    <WarehouseConfigInternalProviderContext.Provider value={configBinding}>
                        {warehouseDef.render.preview()}
                    </WarehouseConfigInternalProviderContext.Provider>
                </WarehouseMetaInternalProviderContext.Provider>
            </SimpleCard>
        })
    })
}

export function WarehouseSelect() {
    const warehouseDef = useNullableContext(WarehouseDefinitionContext)
    const warehouseListReq = useWarehouseList(warehouseDef.type)
    const idBinding = useNullableContext(WarehouseIdBindingContext)
    return <FormItem label={warehouseDef.title}>
        {unwrapAsyncSubs(warehouseListReq, warehouseList => (
            <Select<number | null> 
                binding={idBinding}
                options={[
                    {label: "未选择", value: null},
                    ...warehouseList.map(it => ({
                        label: it.meta.title,
                        value: it.id
                    }))
            ]}/>
        ))}
    </FormItem>
}

export function WarehouseEditor() {
    const idBinding = useNullableContext(WarehouseIdBindingContext)
    if(idBinding.value === null) {
        return <CreateWarehouse/>
    } else {
        return <EditWarehouse warehouseId={idBinding.value}/>
    }
}

function EditWarehouse({warehouseId}: {warehouseId: number}) {
    const client = useLiveToolkitClient()
    const warehouseDef = useNullableContext(WarehouseDefinitionContext)
    const idBinding = useNullableContext(WarehouseIdBindingContext)
    const metaBindingReq = useWarehouseMetaBinding(warehouseDef.type, warehouseId)
    const configBindingReq = useWarehouseConfigBinding(warehouseDef.type, warehouseId)
    const [configBindingTmpReq, saveConfig, isConfigDirty] = useAsyncTemporaryBinding(configBindingReq)
    const [metaBindingTmpReq, saveMeta, isMetaDirty] = useAsyncTemporaryBinding(metaBindingReq)
    async function deleteWarehouse() {
        await idBinding.update(null)
        await client.deleteWarehouse(warehouseDef.type, warehouseId)
    }
    return unwrapAsyncBinding(configBindingTmpReq, configTmp => {
        return unwrapAsyncBinding(metaBindingTmpReq, metaTmpBinding => {
            const titleBinding = propertyBinding(metaTmpBinding, "title")
            return <CardWithActions
                    title={`编辑 ${warehouseDef.title}`}
                    actions={[
                        <QuickConfirm title={`删除 ${warehouseDef.title}`} description="此操作无法恢复" onConfirm={deleteWarehouse}>
                            <LiteDangerButton>清除</LiteDangerButton>
                        </QuickConfirm>,
                        <ActionButton onClick={saveConfig} disabled={!isConfigDirty}>保存</ActionButton>
                    ]}
                >
                    <HStack layout={["1fr", "auto"]} spacing={10}>
                        <FormItem label="标题">
                            <StringField binding={titleBinding}/>
                        </FormItem>
                        <ActionButton onClick={saveMeta} disabled={!isMetaDirty}>保存</ActionButton>
                    </HStack>
                    <Divider/>
                    <WarehouseConfigInternalProviderContext.Provider value={configTmp}>
                        <WarehouseMetaInternalProviderContext.Provider value={metaTmpBinding}>
                            {warehouseDef.render.config()}
                        </WarehouseMetaInternalProviderContext.Provider>
                    </WarehouseConfigInternalProviderContext.Provider>
            </CardWithActions>
        })
    })
}

function CreateWarehouse() {
    const client = useLiveToolkitClient()
    const warehouseDef = useNullableContext(WarehouseDefinitionContext)
    const warehouseIdBinding = useNullableContext(WarehouseIdBindingContext)
    const configBinding = useLocalDBinding(warehouseDef.initialize.defaultConfig())
    const metaBinding = useLocalDBinding<IWarehouseMeta>({title: ""})
    const titleBinding = propertyBinding(metaBinding, "title")
    async function createWarehouse() {
        if(titleBinding.value === "") {
            return
        }
        const id = await client.createWarehouse(warehouseDef.type, {
            meta: {
                title: titleBinding.value
            },
            config: configBinding.value
        })
        await warehouseIdBinding.update(id)
    }
    return <CardWithActions
            title={`创建 ${warehouseDef.title}`}
            actions={[
                <ActionButton onClick={createWarehouse}>创建</ActionButton>
            ]}>
            <FormItem label="标题">
                <StringField binding={titleBinding}/>
            </FormItem>
            <Divider/>
            <WarehouseConfigInternalProviderContext.Provider value={configBinding}>
                <WarehouseMetaInternalProviderContext.Provider value={metaBinding}>
                    {warehouseDef.render.config()}
                </WarehouseMetaInternalProviderContext.Provider>
            </WarehouseConfigInternalProviderContext.Provider>
    </CardWithActions>
}

const WarehouseConfigInternalProviderContext = createNullableContext<DBinding<any>>("useInternalWarehouseConfig is only available in warehouse definition")

export function useInternalWarehouseConfig<C>(): DBinding<C> {
    return useNullableContext<DBinding<C>>(WarehouseConfigInternalProviderContext)
}

const WarehouseMetaInternalProviderContext = createNullableContext<DBinding<IWarehouseMeta>>("useInternalWarehouseMeta is only available in warehouse definition")

export function useInternalWarehouseMeta(): DBinding<IWarehouseMeta> {
    return useNullableContext(WarehouseMetaInternalProviderContext)
}

export interface WarehouseConsumerProps<C> {
    warehouse: WarehouseObject<C>
    children: (meta: DBinding<IWarehouseMeta>, config: DBinding<C>) => React.ReactNode
}

export function WarehouseConsumer<C>({children, warehouse: warehouseInput}: WarehouseConsumerProps<C>) {
    const warehouseDef = useNullableContext(WarehouseDefinitionContext)
    const warehouseId = useNullableContext(WarehouseIdBindingContext)
    if(warehouseDef.type !== warehouseInput.type) {
        throw new Error(`Invalid warehouse consumer for ${warehouseInput.type} in provider for ${warehouseDef.type}`)
    }
    function Internal() {
        if(warehouseId.value === null){
            throw new Error("Invalid state")
        }
        const metaBindingReq = useWarehouseMetaBinding(warehouseDef.type, warehouseId.value)
        const configBindingReq = useWarehouseConfigBinding<C>(warehouseDef.type, warehouseId.value)
        return unwrapAsyncBinding(metaBindingReq, metaBinding => {
            return unwrapAsyncBinding(configBindingReq, configBinding => {
                return <>{children(metaBinding, configBinding)}</>
            })
        })
    }
    if(warehouseId.value === null) {
        return <></>
    } else {
        return <Internal/>
    }
}
