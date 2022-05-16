package chat

import (
	"bytes"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	chat *Chat
	conn *websocket.Conn
	send chan []byte
}

func ConnectClient(chat *Chat, conn *websocket.Conn) {
	client := &Client{chat, conn, make(chan []byte)}
	chat.conenct <- client
	go client.startRead()
	go client.startWrite()
}

func (c *Client) startWrite() {
	defer func() {
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			println("Message")
			println(message)
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Println(err)
				return
			}
		}
	}
}

func (c *Client) startRead() {
	defer func() {
		c.chat.disconenct <- c
		c.conn.Close()
	}()
	// c.conn.SetReadLimit(maxMessageSize)
	// c.conn.SetReadDeadline(time.Now().Add(pongWait))
	// c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		println("Message", message)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		message = bytes.TrimSpace(bytes.Replace(message, []byte{'\n'}, []byte{' '}, -1))
		c.chat.broadcast <- message
	}
}
