import React, {createContext, useEffect, useState} from "react";
import "./styles.css";
import socket from './socket'
import Chat from './components/Chat'
import Select from 'react-select'

export interface IUser {
    id: number;
    username: string;
}

export interface UserOption {
    value: number;
    label: string
}

export const UserContext = createContext(null);

export default function App() {
    const [user, setUser] = useState<IUser>(null);
    const [userSelected, setUserSelected] = useState<boolean>(false);
    const [users, setUsers] = useState<IUser[]>();
    const [userOptions, setUserOptions] = useState<UserOption[]>([]);

    useEffect(() => {
        const pullUsers = async () => {
            const response = await fetch('http://localhost:3001/get-all-users');
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

    useEffect(() => {
        console.log(user);
    }, [user])

    useEffect(() => {
        if (users && users.length > 0){
            setUserOptions(
                users.map(user => { return {value: user.id, label: user.username}})
            )
        }
    }, [users])

    const handleSubmit = () => {
        if (user) {
                setUserSelected(true);
                localStorage.setItem("user", JSON.stringify(user));
                socket.auth = {username: user.username, userId: user.id};
                socket.connect();
        }
    }

    return (
        <UserContext.Provider value={{user, setUser}}>
        <div className="App">
            {/*@ts-ignore*/}
            {!userSelected ?
                <>
                    <h1>Select user</h1>
                    <Select onChange={({value}) => setUser(users[Number(value) -1])} options={userOptions}/>
                    <button onClick={handleSubmit}>Send</button>
                </> :
                <Chat />
            }
        </div>
        </UserContext.Provider>
    );
}
