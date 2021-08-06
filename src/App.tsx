import React, {createContext, ReactElement, useEffect, useState} from "react";
import "./styles.css";
import socket from './socket'
import Chat from './components/Chat'
import Select from 'react-select'
import Modal from "./components/Modal";

export interface IUser {
    id: number;
    username: string;
}

export interface UserOption {
    value: number;
    label: string
}

export interface IModal {
    show: boolean;
    content: ReactElement;
}

export const UserContext = createContext(null);
export const ModalContext = createContext(null);
export const ThemeContext = createContext(null);

export default function App() {
    const [user, setUser] = useState<IUser>(null);
    const [modal, setModal] = useState<IModal>({
        show: false,
        content:
            <React.Fragment>
            </React.Fragment>
    });
    const [userSelected, setUserSelected] = useState<boolean>(false);
    const [users, setUsers] = useState<IUser[]>();
    const [userOptions, setUserOptions] = useState<UserOption[]>([]);
    const [dark, setDark] = useState<boolean>(false);
    const [theme, setTheme] = useState<string>('light-mode');

    useEffect(() => {
        let theme = 'light-mode'
        if (dark){
            theme = 'dark-mode'
        }
        setTheme(theme);
    }, [dark])

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
            <ModalContext.Provider value={{modal, setModal}}>
                <ThemeContext.Provider value={{dark, setDark}}>
        <div className={`App ${theme && theme}`}>
            <button className={'pos-ab m-auto top-right'} style={{zIndex: 110}} onClick={() => setDark(!dark)}>{dark ? <h2 style={{padding: '0 2px'}}>&#9728;</h2> : <h2 style={{paddingRight: '4px'}}>&#9789;</h2>}</button>
            {modal.show && <Modal />}
            {!userSelected ?
                <div className={'centered-box'}>
                    <div>
                        <h1>Select user</h1>
                    </div>
                    <Select className={'react-select'} onChange={({value}) => setUser(users[Number(value) -1])} options={userOptions}/>
                    <button onClick={handleSubmit}>Send</button>
                </div> :
                <Chat />
            }
        </div>
                </ThemeContext.Provider>
            </ModalContext.Provider>
        </UserContext.Provider>
    );
}
