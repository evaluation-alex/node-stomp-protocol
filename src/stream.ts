import { StompFrame, StompEventEmitter } from "./model";
import { EventEmitter } from "events";
import { Socket } from "net";


type StompStreamEvent = 'data' | 'end';

export interface StompStreamLayer {

    emitter: StompEventEmitter<StompStreamEvent>;

    send(data: string): Promise<void>;

    close(): Promise<void>;

}

export function openStompStream(socket: Socket): StompStreamLayer {

    return new StompSocketStreamLayer(socket);

}


class StompSocketStreamLayer implements StompStreamLayer {

    public emitter = new StompEventEmitter();

    constructor(private readonly socket: Socket) {
        this.socket.on('data', (data) => this.onSocketData(data));
        this.socket.on('error', (err) => this.onSocketEnd(err));
        this.socket.on('end', () => this.onSocketEnd());
    }

    private onSocketData(data: Buffer) {
        if (this.emitter) {
            this.emitter.emit('data', data);
        }
        //frameEmitter.handleData(data);
    }

    private onSocketEnd(err?: Error) {
        try {
            if (this.emitter) {
                this.emitter.emit('end', err);
            }
            // subscriptions.map(function(queue) {
            //   queueManager.unsubscribe(queue, sessionId);
            // });
        } finally {
            this.socket.end();
        }
    }

    public async send(data: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.socket.write(data, resolve);
        });
    }

    public async close(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.socket.end(resolve);
        });
    }

}
