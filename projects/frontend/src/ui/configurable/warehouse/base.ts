import { DBinding } from "@pltk/components"

export interface WarehouseDefinition<Config> {
    title: string
    type: string
    warehouseDependencies?: WarehouseDefinition<any>[]
    render: {
        config: (binding: DBinding<Config>) => JSX.Element
    }
}

export type WarehouseObject<C> = WarehouseDefinition<C>

