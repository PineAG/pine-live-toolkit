import { IPanel, IPanelReference, IWidgetReference, Rect } from "@pltk/protocol";
import { useLiveToolkitClient as useClient, usePanelId, useWidgetId } from "./base";
import { AsyncBindingResult, AsyncSubscriptionResult, useAsyncBinding, useAsyncSubscription } from "./subs";

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
