const label = document.querySelector("#lbl-pending");
const divPending = document.querySelector('.alert')
const deskHeader = document.querySelector('h1')
const lblCurrentTicket = document.querySelector('small')

const btnDraw = document.querySelector('#btn-draw')
const btnDone = document.querySelector('#btn-done')

const searchParams = new URLSearchParams(window.location.search)

if(!searchParams.has('escritorio')){
    window.location = 'index.html'
    throw new Error('Escritorio es requerido')
}

const deskNumber = searchParams.get('escritorio')
let workingTicket = null;
deskHeader.innerHTML = deskNumber

function checkTicketCount(currentCount = 0){
  if(currentCount === 0){
    divPending.classList.remove('d-none')
  } else {
    divPending.classList.add('d-none')
  }
  label.innerHTML = currentCount
    
}

async function getTicketsPending() {
  const pendingTickets = await fetch("api/ticket/pending").then((res) => res.json());

  // label.innerHTML = pendingTickets.length || 0;
  checkTicketCount(pendingTickets.length)
}

async function finishTicket() {
  if(!workingTicket) return

  const {status, message} = await fetch(`/api/ticket/done/${workingTicket.id}`, {
    method: 'PUT',
  }).then(res => res.json())

  console.log({status, message})

  if(status === 'ok'){
    workingTicket = null
    lblCurrentTicket.innerHTML = 'Nadie'
  }


}

async function getTicket() {
  await finishTicket()

  const {status, ticket, message} = await fetch(`/api/ticket/draw/${deskNumber}`)
    .then(res => res.json());
  console.log(ticket)

  if(status === 'error'){
    lblCurrentTicket.innerHTML = message;
    return
  }

  workingTicket = ticket
  lblCurrentTicket.innerHTML = ticket.number
}

function connectToWebSockets() {
  const socket = new WebSocket("ws://localhost:3000/ws");

  socket.onmessage = (event) => {
    const { type, payload } = JSON.parse(event.data);
    // on-ticket-count-changued
    if(type !== 'on-ticket-count-changued') return

    // label.innerHTML = payload;
    checkTicketCount(payload)
  };

  socket.onclose = (event) => {
    console.log("Connection closed");
    setTimeout(() => {
      console.log("retrying to connect");
      connectToWebSockets();
    }, 1500);
  };

  socket.onopen = (event) => {
    console.log("Connected");
  };
}


// Listeners
btnDraw.addEventListener('click', getTicket)
btnDone.addEventListener('click', finishTicket)

// Init
connectToWebSockets();
getTicketsPending();
