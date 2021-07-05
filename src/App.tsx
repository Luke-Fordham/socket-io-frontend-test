import React, {useEffect, useState} from "react";
import "./styles.css";
import socket from './socket'
import Chat from './components/Chat'
import Select from 'react-select'

export interface IUser {
    id: number;
    username: string;
}

export default function App() {
    const [user, setUser] = useState<IUser>(null);
    const [userSelected, setUserSelected] = useState<boolean>(false);
    const [users, setUsers] = useState<IUser[]>();

    useEffect(() => {
        const pullUsers = async () => {
            const response = await fetch('http://localhost:8080/get-all-users');
            const results = await response.json();
            console.log(results);
            if (results.success) {
                setUsers(results.users)
            }
        }
        pullUsers();

        socket.onAny((event, ...args) => {
            console.log(event, args);
        });
        socket.on("connect_error", (err) => {
            if (err.message === "invalid username") {
                setUserSelected(false);
            }
        });
    }, [])

    const handleSubmit = () => {
        if (user) {
                setUserSelected(true);
                socket.auth = {username: user.username, userId: user.id};
                socket.connect();
        }
    }

    return (
        <div className="App">
            {/*@ts-ignore*/}
            {!userSelected ?
                <>
                    <h1>Select user</h1>
                    <Select onChange={({value}) => setUser(users[Number(value)])} options={ users && users.length > 0 && users.map(user => { return {value: String(user.id), label: user.username}})}/>
                    <button onClick={handleSubmit}>Send</button>
                </> :
                <Chat user={user} />
            }
        </div>
    );
}
