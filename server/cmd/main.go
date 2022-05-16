package main

import (
	"flag"
	"go-chain-chat/controllers"
	"go-chain-chat/services/chat"
	"log"
	"net/http"
)

var addr = flag.String("addr", ":8080", "http service address")

func main() {
	flag.Parse()
	chat := chat.NewChat()
	go chat.Start()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		controllers.StartClient(chat, w, r)
	})
	log.Println("Starting a server", *addr)
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
