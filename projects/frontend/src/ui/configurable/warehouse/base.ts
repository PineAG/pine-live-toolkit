export interface WarehouseDefinition<Config> {
    title: string
    type: string
    initialize: {
        defaultConfig: () => Config
    }
    render: {
        config: () => React.ReactNode
        preview: () => React.ReactNode
    }
}

export type WarehouseObject<C> = WarehouseDefinition<C>
