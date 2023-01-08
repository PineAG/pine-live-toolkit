export type SubscriptionEvents = {
    PanelList: {}
    Panel: {panelId: number}
    WidgetListOfPanel: {panelId: number}
    WidgetRect: {panelId: number, widgetId: number}
    WidgetConfig: {panelId: number, widgetId: number}
}

export type SubscriptionActions = {
    Subscribe: SubscriptionEvents
    Dispose: SubscriptionEvents
}
