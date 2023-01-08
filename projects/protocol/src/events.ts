export type SubscriptionEventsDefinition = {
    PanelList: {}
    Panel: {panelId: number}
    WidgetListOfPanel: {panelId: number}
    WidgetRect: {panelId: number, widgetId: number}
    WidgetConfig: {panelId: number, widgetId: number}
}

export type SubscriptionEvent = {
    [K in keyof SubscriptionEventsDefinition]: {
        type: K
        parameters: SubscriptionEventsDefinition[K]
    }
}[keyof SubscriptionEventsDefinition]

export enum SubscriptionActionType {
    Subscribe = "subscribe",
    Dispose = "dispose",
    Update = "update"
}

export type SubscriptionAction = {
    action: SubscriptionActionType
    event: SubscriptionEvent
}
