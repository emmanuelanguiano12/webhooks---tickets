import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws'

interface Options {
    server: Server;
    path?: string
}

// Conectar express con ws en el mismo servidor
// Usar la instancia para conectarse en todos lados
export class WssService {
    private static _instance: WssService;
    private wss: WebSocketServer;

    private constructor(options: Options){
        const {server, path = '/ws'} = options //localhost:3000/ws

        this.wss = new WebSocketServer({server, path})
        this.start();
    }

    // Crear getter para la instancia privada de nuestro servidor
    static get instance(): WssService{
        if(!WssService._instance){
            throw 'WssService is not initialized'
        }

        return WssService._instance;
    }

    static initWebSocketServer(options: Options){
        WssService._instance = new WssService(options)
    }

    // Mandar mensaje a todos los clientes
    public senMessage(type: string, payload: Object){

        // Mandar a todos los clientes
        this.wss.clients.forEach(client => {
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify({type, payload})) // Mandar al cliente el type y el payload
            }
        })

    }

    public start(){
        
        this.wss.on('connection', (ws: WebSocket) => {
            console.log('Client connected')

            ws.on('close', () => {
                console.log('Client disconnected')
            })

        })
    }

}