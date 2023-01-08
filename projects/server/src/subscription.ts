import { IDisposable, ILiveToolkitSubscription, SubscriptionActionType, SubscriptionCallback, SubscriptionEvent } from "@pltk/protocol"
import {createServer} from "http"
import * as SocketIO from "socket.io"

function eventToRoomName(evt: SubscriptionEvent): string {
    const segments: string[] = []
    segments.push(evt.type)
    if("panelId" in evt.parameters) {
        segments.push(`panel_${evt.parameters.panelId}`)
    }
    if("widgetId" in evt.parameters) {
        segments.push(`widget_${evt.parameters.widgetId}`)
    }
    return segments.join("/")
}

export function emitMessage(io: SocketIO.Server, evt: SubscriptionEvent) {
    const roomName = eventToRoomName(evt)
    io.to(roomName).emit(SubscriptionActionType.Update)
}

type HttpServer = ReturnType<typeof createServer>

export function initializeSubscription(httpServer: HttpServer): SocketIO.Server {
    const io = new SocketIO.Server(httpServer, {
        "path": "/subscription"
    })
    io.on("connection", socket => {
        socket.on(SubscriptionActionType.Subscribe, (evt: SubscriptionEvent) => {
            const roomName = eventToRoomName(evt)
            socket.join(roomName)
        })
        socket.on(SubscriptionActionType.Dispose, (evt: SubscriptionEvent) => {
            const roomName = eventToRoomName(evt)
            socket.leave(roomName)
        })
    })
    return io
}
