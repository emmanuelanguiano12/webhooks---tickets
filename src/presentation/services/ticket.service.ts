import { UuidAdapter } from "../../config/uuid.adapter";
import { Ticket } from "../../domain/interfaces/ticket";
import { WssService } from "./wss.service";

export class TicketService{
    constructor(
        private readonly wssService = WssService.instance
    ){}

    public tickets: Ticket[] = [
        {id: UuidAdapter.v4(), number: 1, createdAt: new Date(), done: false},
        {id: UuidAdapter.v4(), number: 2, createdAt: new Date(), done: false},
        {id: UuidAdapter.v4(), number: 3, createdAt: new Date(), done: false},
        {id: UuidAdapter.v4(), number: 4, createdAt: new Date(), done: false},
        {id: UuidAdapter.v4(), number: 5, createdAt: new Date(), done: false},
        {id: UuidAdapter.v4(), number: 6, createdAt: new Date(), done: false},
    ];

    private readonly workingOnTickets: Ticket[] = []

    public get pendingTickets(): Ticket[]{
        return this.tickets.filter(ticket => !ticket.handleAtDesk);
    }

    public get lastWorkingOnTickets(): Ticket[]{
        // Mostrar los primeros 4 tickets (los tickets se van insertando para arriba con el unshift)
        return this.workingOnTickets.slice(0,4)
    }

    public get lastTicketNumber(): number{
        return this.tickets.length > 0 ? this.tickets.at(-1)!.number : 0
    }

    public createTicket(){

        const ticket: Ticket = {
            id: UuidAdapter.v4(),
            number: this.lastTicketNumber + 1,
            createdAt: new Date,
            done: false,
            handleAt: undefined,
            handleAtDesk: undefined
        }
    
        this.tickets.push(ticket)

        //? ws
        this.onTicketNumberChangue();

        return ticket
    }

    public drawTicket(desk: string){

        const ticket = this.tickets.find(ticket => !ticket.handleAtDesk)
        if(!ticket) return {status: 'error', message: 'No hay tickets'}

        ticket.handleAtDesk = desk;
        ticket.handleAt = new Date;

        // Mostrar el ticket en pantalla
        this.workingOnTickets.unshift({...ticket})
        this.onTicketNumberChangue();
        this.onWorkingOnChanged()

        return {status: 'ok', ticket}

    }

    public onFinishTicket(id: string){
        const ticket = this.tickets.find(ticket => ticket.id === id)
        if(!ticket) return {status: 'error', message: 'Ticket no encontrado'}

        this.tickets = this.tickets.map(ticket => {
            if(ticket.id === id){
                ticket.done = true
            }
            return ticket
        })

        return {status: 'ok'}
    }

    private onTicketNumberChangue(){
        this.wssService.senMessage('on-ticket-count-changued', this.pendingTickets.length)
    }

    private onWorkingOnChanged(){
        this.wssService.senMessage('on-working-changed', this.lastWorkingOnTickets)
    }

}