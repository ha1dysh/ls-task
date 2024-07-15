import { useEffect, useState } from "react";
import io from "socket.io-client";
const socket = io("http://0.0.0.0:3000");

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState("");

  useEffect(() => {
    socket.on("command", (msg) => {
      if (msg.error) {
        return setMessages(msg.error);
      }
      setMessages((s) => (s += msg.data));
    });
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    socket.emit("command", { command: input });
  }

  return (
    <>
      <pre className="messages">{messages}</pre>
      <form onSubmit={handleSubmit}>
        <input id="input" onChange={(e) => setInput(e.target.value)} />
        <button>Send</button>
      </form>
    </>
  );
}

export default App;
