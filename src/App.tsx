import React, {useEffect, useState} from "react";
import "./styles.css";
import socket from './socket'
import Chat from './components/Chat'

export default function App() {
    const [username, setUsername] = useState<string | null>(null);
    const [usernameSelected, setUsernameSelected] = useState<boolean>(false);

    useEffect(() => {
        console.log(usernameSelected);
        socket.onAny((event, ...args) => {
            console.log(event, args);
        });
        socket.on("connect_error", (err) => {
            if (err.message === "invalid username") {
                setUsernameSelected(false);
            }
        });
    }, [])

    const handleSubmit = () => {
        if (username) {
            const user = username.split(' ').join('').replace(' ', '');
            if (user && user.length > 0) {
                setUsernameSelected(true);
                socket.auth = {username: user};
                socket.connect();
            }
        }
    }

    return (
        <div className="App">
            {/*@ts-ignore*/}
            {!usernameSelected ?
                <>
                    <h1>Input username</h1>
                    <input value={username ? username : ''} placeholder={'Your username'}
                           onChange={(e) => setUsername(e.target.value)}/>
                    <button onClick={handleSubmit}>Send</button>
                </> :
                <Chat/>
            }
        </div>
    );
}
