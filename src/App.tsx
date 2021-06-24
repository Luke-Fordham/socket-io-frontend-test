import React, {useEffect, useState} from "react";
import "./styles.css";
import socket from './socket'

export default function App() {
    const [username, setUsername] = useState<string|null>(null);

    useEffect(() => {
        socket.onAny((event, ...args) => {
            console.log(event, args);
        });
        socket.on("connect_error", (err) => {
            if (err.message === "invalid username") {
                setUsername(null);
            }
        });
    }, [])

    const handleSubmit = () => {
        if (username){
            const user = username.split(' ').join('').replace(' ', '');
            if (user && user.length > 0) {
                socket.auth = {username: user};
                socket.connect();
            }
        }
    }

    return (
    <div className="App">
      <h1>Input username</h1>
        {/*@ts-ignore*/}
        <input value={username ? username : ''} placeholder={'Your username'} onChange={(e) => setUsername(e.target.value)}/>
        <button onClick={handleSubmit}>Send</button>
    </div>
  );
}
