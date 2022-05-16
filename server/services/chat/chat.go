package chat

import "log"

type Chat struct {
	clients    map[*Client]bool
	conenct    chan *Client
	disconenct chan *Client
	broadcast  chan []byte
}

func NewChat() *Chat {
	return &Chat{
		clients:    make(map[*Client]bool),
		conenct:    make(chan *Client),
		disconenct: make(chan *Client),
		broadcast:  make(chan []byte),
	}
}

func (c *Chat) Start() {
	log.Println("Starting chat")
	for {
		select {
		case client := <-c.conenct:
			println("Connecting client", client)
			c.clients[client] = true
		case client := <-c.disconenct:
			println("Disconnecting client", client)
			if _, ok := c.clients[client]; ok {
				delete(c.clients, client)
				close(client.send)
			}
		case message := <-c.broadcast:
			for client := range c.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(c.clients, client)
				}
			}
		}
	}
}
