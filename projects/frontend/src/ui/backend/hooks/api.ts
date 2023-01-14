import {useState, useEffect} from "react"
import { IDisposable, IPanel, IPanelReference, IWarehouseMeta, IWarehouseReference, IWidgetReference, Rect } from "@pltk/protocol";
import { useAPISubscriptionCache, useLiveToolkitClient as useClient} from "./base";
import { CacheStore } from "./cache";
import { AsyncBindingResult, AsyncSubscriptionResult } from "./subs";

function useSubsCacheResult<T>(deps: any[], subs: (c: CacheStore, cb: (v: T) => void) => IDisposable): AsyncSubscriptionResult<T> {
    const cache = useAPISubscriptionCache()
    const [result, setResult] = useState<AsyncSubscriptionResult<T>>({status: "pending"})
    useEffect(() => {
        const d = subs(cache, v => setResult({status: "success", value: v}))
        return () => d.close()
    }, deps)
    return result
}

function resultToBinding<T>(result: AsyncSubscriptionResult<T>, setter: (v: T) => Promise<void>): AsyncBindingResult<T> {
    if(result.status === "success") {
        return {
            status: "success",
            binding: {
                value: result.value,
                update: setter
            }
        }
    } else {
        return result
    }
}

export function usePanels(): AsyncSubscriptionResult<IPanelReference[]> {
    return useSubsCacheResult([], (c, cb) => c.subscribePanelList(cb))
}

export function usePanel(panelId: number): AsyncSubscriptionResult<IPanel> {
    return useSubsCacheResult([panelId], (c, cb) => c.subscribePanel(panelId, cb))
}

export function useWidgetListOfPanel(panelId: number): AsyncSubscriptionResult<IWidgetReference[]> {
    return useSubsCacheResult([panelId], (c, cb) => c.subscribeWidgets(panelId, cb))
}

export function useWidgetRectBinding(panelId: number, widgetId: number): AsyncBindingResult<Rect> {
    const client = useClient()
    const result = useSubsCacheResult<Rect>([panelId, widgetId], (c, cb) => c.subscribeWidgetRect(panelId, widgetId, cb))
    return resultToBinding(result, value => client.setWidgetRect(panelId, widgetId, value))
}

export function useWidgetConfigBinding<Config>(panelId: number, widgetId: number): AsyncBindingResult<Config> {
    const client = useClient()
    const result = useSubsCacheResult<Config>([panelId, widgetId], (c, cb) => c.subscribeWidgetConfig(panelId, widgetId, cb))
    return resultToBinding<Config>(result, value => client.setWidgetConfig(panelId, widgetId, value))
}

export function useWarehouseList(warehouseType: string): AsyncSubscriptionResult<IWarehouseReference[]> {
    return useSubsCacheResult<IWarehouseReference[]>([warehouseType], (c, cb) => c.subscribeWarehouseList(warehouseType, cb))
}

export function useWarehouseMetaBinding(warehouseType: string, warehouseId: number): AsyncBindingResult<IWarehouseMeta> {
    const client = useClient()
    const result = useSubsCacheResult<IWarehouseMeta>([warehouseType, warehouseId], (c, cb) => c.subscribeWarehouseMeta(warehouseType, warehouseId, cb))
    return resultToBinding<IWarehouseMeta>(result, value => client.setWarehouseMeta(warehouseType, warehouseId, value))
}

export function useWarehouseConfigBinding<C>(warehouseType: string, warehouseId: number): AsyncBindingResult<C> {
    const client = useClient()
    const result = useSubsCacheResult<C>([warehouseType, warehouseId], (c, cb) => c.subscribeWarehouseConfig<C>(warehouseType, warehouseId, cb))
    return resultToBinding<C>(result, value => client.setWarehouseConfig<C>(warehouseType, warehouseId, value))
}
