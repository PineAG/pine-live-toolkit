import { IPanel, IPanelReference, IWarehouse, IWarehouseReference, IWidgetReference, Rect } from "./base"

type SubscriptionEventsDefinition = {
    PanelList: {
        args: {}
        returns: IPanelReference[]
    }
    Panel: {
        args: {panelId: number}
        returns: IPanel
    }
    WidgetListOfPanel: {
        args: {panelId: number},
        returns: IWidgetReference[]
    }
    WidgetRect: {
        args: {panelId: number, widgetId: number}
        returns: Rect
    }
    WidgetConfig: {
        args: {panelId: number, widgetId: number}
        returns: any
    },
    WarehouseList: {
        args: {warehouseType: string},
        returns: IWarehouseReference[]
    },
    WarehouseMeta: {
        args: {warehouseType: string, warehouseId: number},
        returns: string
    },
    WarehouseConfig: {
        args: {warehouseType: string, warehouseId: number},
        returns: any
    }
}

export type SubscriptionTypes = keyof SubscriptionEventsDefinition

export type SubscriptionEvent = {
    [K in SubscriptionTypes]: {
        type: K
        parameters: SubscriptionEventsDefinition[K]["args"]
    }
}[SubscriptionTypes]

export type SubscriptionEventMapping<K extends SubscriptionTypes> = {
    type: K
    parameters: SubscriptionEventsDefinition[K]["args"]
}

export type SubscriptionParameters = {
    [K in SubscriptionTypes]: SubscriptionEventsDefinition[K]["args"]
}

export type SubscriptionReturns = {
    [K in SubscriptionTypes]: SubscriptionEventsDefinition[K]["returns"]
}

export enum SubscriptionActionType {
    Subscribe = "subscribe",
    Dispose = "dispose",
    Update = "update"
}

export type SubscriptionAction = {
    action: SubscriptionActionType
    event: SubscriptionEvent
}
