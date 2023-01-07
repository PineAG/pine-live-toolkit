import { DBinding } from "@pltk/components";
import { IDisposable, IPanel, IPanelReference, IWidgetReference, Rect, SubscriptionCallback } from "@pltk/protocol";
import { useEffect, useState } from "react";
import { useLiveToolkitClient as useClient, usePanelId, useWidgetId } from "./base";

interface UseAsyncSubscriptionOptions<T> {
    fetch(): Promise<T>
    subscription: (callback: SubscriptionCallback) => IDisposable
    dependencies: any[]
}

export type AsyncSubscriptionResult<T> = {status: "pending"} | {status: "success", value: T}

function useAsyncSubscription<T>(options: UseAsyncSubscriptionOptions<T>): AsyncSubscriptionResult<T> {
    const [value, setValue] = useState<T | null>(null)
    async function update() {
        const value = await options.fetch()
        setValue(value)
    }
    useEffect(() => {
        update()
        const disposable = options.subscription(() => update())
        return () => disposable.close()
    }, options.dependencies)
    if(value === null) {
        return {status: "pending"}
    } else {
        return {status: "success", value}
    }
}

interface UseAsyncBindingOptions<T> {
    fetch(): Promise<T>
    update(value: T): Promise<void>
    subscription: (callback: SubscriptionCallback) => IDisposable
    dependencies: any[]
}

export type AsyncBindingResult<T> = {status: "pending"} | {status: "success", binding: DBinding<T>}
function useAsyncBinding<T>(options: UseAsyncBindingOptions<T>): AsyncBindingResult<T> {
    const subs = useAsyncSubscription(options)
    if(subs.status === "success") {
        return {
            status: "success",
            binding: {
                value: subs.value,
                update: v => options.update(v)
            }
        }
    } else {
        return subs
    }
}

export function usePanels(): AsyncSubscriptionResult<IPanelReference[]> {
    const client = useClient()
    return useAsyncSubscription({
        fetch: () => client.getPanels(),
        subscription: cb => client.subscribePanels(cb),
        dependencies: []
    })
}

export function usePanel(): AsyncSubscriptionResult<IPanel> {
    const panelId = usePanelId()
    const client = useClient()
    return useAsyncSubscription({
        fetch: () => client.getPanel(panelId),
        subscription: cb => client.subscribePanel(panelId, cb),
        dependencies: [panelId]
    })
}

export function useWidgetListOfPanel(): AsyncSubscriptionResult<IWidgetReference[]> {
    const panelId = usePanelId()
    const client = useClient()
    return useAsyncSubscription({
        fetch: () => client.getWidgetsOfPanel(panelId),
        subscription: cb => client.subscribeWidgetsOfPanel(panelId, cb),
        dependencies: [panelId]
    })
}

export function useWidgetRectBinding(): AsyncBindingResult<Rect> {
    const panelId = usePanelId()
    const widgetId = useWidgetId()
    const client = useClient()
    return useAsyncBinding({
        fetch: () => client.getWidgetRect(panelId, widgetId),
        update: v => client.setWidgetRect(panelId, widgetId, v),
        subscription: cb => client.subscribeWidgetRect(panelId, widgetId, cb),
        dependencies: [panelId, widgetId]
    })
}

export function useWidgetConfigBinding<Config>(): AsyncBindingResult<Config> {
    const panelId = usePanelId()
    const widgetId = useWidgetId()
    const client = useClient()
    return useAsyncBinding({
        fetch: () => client.getWidgetConfig(panelId, widgetId),
        update: v => client.setWidgetConfig(panelId, widgetId, v),
        subscription: cb => client.subscribeWidgetConfig(panelId, widgetId, cb),
        dependencies: [panelId, widgetId]
    })
}
