import {useState, useEffect} from "react"
import { IDisposable, IPanel, IPanelReference, IWidgetReference, Rect } from "@pltk/protocol";
import { useAPISubscriptionCache, useLiveToolkitClient as useClient, usePanelId, useWidgetId } from "./base";
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

export function usePanel(): AsyncSubscriptionResult<IPanel> {
    const panelId = usePanelId()
    return useSubsCacheResult([panelId], (c, cb) => c.subscribePanel(panelId, cb))
}

export function useWidgetListOfPanel(): AsyncSubscriptionResult<IWidgetReference[]> {
    const panelId = usePanelId()
    return useSubsCacheResult([panelId], (c, cb) => c.subscribeWidgets(panelId, cb))
}

export function useWidgetRectBinding(): AsyncBindingResult<Rect> {
    const panelId = usePanelId()
    const widgetId = useWidgetId()
    const client = useClient()
    const result = useSubsCacheResult<Rect>([panelId, widgetId], (c, cb) => c.subscribeWidgetRect(panelId, widgetId, cb))
    return resultToBinding(result, value => client.setWidgetRect(panelId, widgetId, value))
}

export function useWidgetConfigBinding<Config>(): AsyncBindingResult<Config> {
    const panelId = usePanelId()
    const widgetId = useWidgetId()
    const client = useClient()
    const result = useSubsCacheResult<Config>([panelId, widgetId], (c, cb) => c.subscribeWidgetConfig(panelId, widgetId, cb))
    return resultToBinding<Config>(result, value => client.setWidgetConfig(panelId, widgetId, value))
}