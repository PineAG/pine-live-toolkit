import { WarehouseObject } from "./base";

export class WarehouseWrapper<Config> {
    constructor(private warehouse: WarehouseObject<Config>, private id: number) {}

    public Config = () => {
        
    }
}
