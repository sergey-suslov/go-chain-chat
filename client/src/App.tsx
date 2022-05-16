import React, { useCallback, useState } from "react";
import shortId from "shortid";
import "./App.css";
import { useSocket } from "./service/socket";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const onMessage = useCallback((message: string) => {
    setMessages((m) => [message, ...m]);
  }, []);
  const { sendMessage, isConnected } = useSocket(onMessage);
  const [inputValue, setInputValue] = useState("");
  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
  };
  const onSubmit = useCallback(() => {
    if (!inputValue || !isConnected) {
      return;
    }
    setInputValue("");
    sendMessage(inputValue);
  }, [inputValue, isConnected, sendMessage]);

  return (
    <div className="App">
      <div className="container">
        <div className="messages-container">
          {messages.map((m) => (
            <div key={shortId.generate()}>
              <span className="sub-text">{m}</span>
            </div>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <input
            type="text"
            placeholder="Enter your message!"
            value={inputValue}
            onChange={onInputChange}
          />
          <button type="submit" className="cta-button submit-gif-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
