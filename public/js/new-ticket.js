
const label = document.querySelector('#lbl-new-ticket')
const createTicketBtn = document.querySelector('button')

async function getLastTicket(){
    const lastTicket = await fetch('/api/ticket/last').then(res => res.json())
    
    label.innerHTML = lastTicket;
}

async function createTicket(){
    const newTicket = await fetch('/api/ticket', {
        method: 'Post'
    }).then(res => res.json())

    label.innerHTML = newTicket.number;
}

createTicketBtn.addEventListener('click', createTicket)
getLastTicket()
