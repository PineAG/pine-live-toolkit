import Ajv from "ajv"

import idSchemaConfig from "./IDType.json"
import panelSchemaConfig from "./PanelType.json"
import rectSchemaConfig from "./RectType.json"
import widgetSchemaConfig from "./WidgetType.json"
import widgetMetaSchemaConfig from "./WidgetMetaType.json"
import sizeSchema from "./SizeType.json"
import panelMetaSchema from "./PanelMetaType.json"
import eventSchema from "./EventType.json"
import warehouseMetaSchema from "./WarehouseMetaType.json"
import newWarehouseSchema from "./NewWarehouseType.json"
import { IDType, PanelType, RectType, WidgetMetaType, WidgetType, SizeType, PanelMetaType, EventType, NewWarehouseType, WarehouseMetaType } from "./types"

const ajv = new Ajv()


const validateId = ajv.compile(idSchemaConfig)
export function isId(obj: any): obj is IDType {
    return validateId(obj)
}

const validatePanel = ajv.compile(panelSchemaConfig)
export function isPanel(obj: any): obj is PanelType {
    return validatePanel(obj)
}

const validateRect = ajv.compile(rectSchemaConfig)
export function isRect(obj: any): obj is RectType {
    return validateRect(obj)
}

const validateWidget = ajv.compile(widgetSchemaConfig)
export function isWidget(obj: any): obj is WidgetType {
    return validateWidget(obj)
}

const validateWidgetMeta = ajv.compile(widgetMetaSchemaConfig)
export function isWidgetMeta(obj: any): obj is WidgetMetaType {
    return validateWidgetMeta(obj)
}

const validateSize = ajv.compile(sizeSchema)
export function isSize(obj: any): obj is SizeType {
    return validateSize(obj)
}

const validatePanelMeta = ajv.compile(panelMetaSchema)
export function isPanelMeta(obj: any): obj is PanelMetaType {
    return validatePanelMeta(obj)
}

const validateEvent = ajv.compile(eventSchema)
export function isEvent(obj: any): obj is EventType {
    return validateEvent(obj)
}

const validateWarehouseMeta = ajv.compile(warehouseMetaSchema)
export function isWarehouseMeta(obj: any): obj is WarehouseMetaType {
    return validateWarehouseMeta(obj)
}

const validateNewWarehouse = ajv.compile(newWarehouseSchema)
export function isNewWarehouse(obj: any): obj is NewWarehouseType {
    return validateNewWarehouse(obj)
}
