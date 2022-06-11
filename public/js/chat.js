const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// const autoscroll = () => {
//     //New message element
//     const $newMessage = $messages.lastElementChild

//     //Height of the new message
//     const newMessageStyles = getComputedStyle($newMessage)
//     const newMessageMargin = parseInt(newMessageStyles.marginBottom)
//     const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

//     //Visible Hieght
//     const visibleHeight = $messages.offsetHeight

//     //Height of messages container
//     const containerHeight = $messages.scrollHeight

//     //How far have i scrolled?
//     const scrollOffset = $messages.scrollTop + visibleHeight

//     if(containerHeight - newMessageHeight <= scrollOffset) {
//         $messages.scrollTop = $messages.scrollHeight
//     }

// }

socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html) 
    // autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        url: message.url,
        username: message.username,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    // autoscroll()
}) 

socket.on('roomData', ({ room, users }) =>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled', 'disabled')

    // disable
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        // enable
        if(error) {
            return console.log(error)
        }
        console.log('Message Delivered!')
    }
    )
    
})

$locationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation) {
        return alert('Geolocation is not suported by your browser')
    }
    //disable
    $locationButton.setAttribute('disabled', 'disabled')
    
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            console.log('Location Shared!')
            $locationButton.removeAttribute('disabled')
            //enable
        })
})
    })

socket.emit('join', { username, room }, (error)=>{
    if(error) {
        alert(error)
        location.href = '/'
    }
})