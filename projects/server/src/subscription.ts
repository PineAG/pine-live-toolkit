import { SubscriptionActionType, SubscriptionEvent } from "@pltk/protocol"
import { createServer } from "http"
import * as SocketIO from "socket.io"
import { isEvent } from "./schema"

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
    io.in(roomName).emit(SubscriptionActionType.Update, evt)
}

type HttpServer = ReturnType<typeof createServer>

export function initializeSubscription(httpServer: HttpServer): SocketIO.Server {
    const io = new SocketIO.Server(httpServer, {
        "path": "/subscription"
    })
    io.on("connection", socket => {
        console.log("CONNECT!")
        socket.on(SubscriptionActionType.Subscribe, (evt) => {
            if(isEvent(evt)) {
                const roomName = eventToRoomName(evt)
                socket.join(roomName)
            } else {
                console.error("Invalid event:", evt)
            }
        })
        socket.on(SubscriptionActionType.Dispose, (evt) => {
            if(isEvent(evt)) {
                const roomName = eventToRoomName(evt)
                socket.leave(roomName)
            } else {
                console.error("Invalid event:", evt)
            }
        })
        socket.on("disconnect", () => {
            console.log("DISCONNECTED!")
        })
    })
    return io
}
