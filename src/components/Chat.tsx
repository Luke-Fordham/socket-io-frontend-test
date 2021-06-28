import React, {useEffect, useState} from 'react';
import socket from '../socket';
import Select from 'react-select';
import {Link, Switch, Route, BrowserRouter as Router, useRouteMatch} from 'react-router-dom'

export interface IUser {
    hasNewMessages: boolean;
    self?: boolean;
    userID?: string;
    username: string;
    messages?: { content: string, fromSelf: boolean }[];
    connected?: boolean;
}

const Chat = () => {
    const [users, setUsers] = useState<IUser[]>();
    const [selectedUser, setSelectedUser] = useState<IUser>();
    const [newMessage, setNewMessage] = useState<{ content: string, from: string }>();
    const [connected, setConnected] = useState<string>('none');

    const initReactiveProperties = (user: IUser) => {
        user.hasNewMessages = false;
    };

    useEffect(() => {
        users && console.log("USERS: \n", users);
    }, [users])

    useEffect(() => {
        socket.on("users", (users: IUser[]) => {
            users.forEach((user) => {
                user.self = user.userID === socket.id;
                initReactiveProperties(user);
            });
            // put the current user first, and then sort by username
            const sortedUsers = users.sort((a, b) => {
                if (a.self) return -1;
                if (b.self) return 1;
                if (a.username < b.username) return -1;
                return a.username > b.username ? 1 : 0;
            });
            setUsers(sortedUsers);
        });

        socket.on("user connected", (user) => {
            initReactiveProperties(user);
            const newUserList = users ? [...users] : [];
            newUserList.push(user);
            setUsers(newUserList);
        });
    }, [users])

    // socket.on("connect", () => {
    //     const newList = users && [...users];
    //     newList && newList.length > 0 && newList.forEach((user, i) => {
    //         if (user.self) {
    //             user.connected = true;
    //         }
    //         newList[i] = user;
    //         setUsers(newList);
    //     });
    // });
    //
    // socket.on("disconnect", () => {
    //     const newList = users && [...users];
    //     newList && newList.length > 0 && newList.forEach((user, i) => {
    //         if (user.self) {
    //             user.connected = false;
    //         }
    //         newList[i] = user;
    //         setUsers(newList);
    //     });
    // });

    // // ------------------------------------------------------------------------------------------------------------------------------------------------------
    const Room = () => {
        const [user, setUser] = useState<IUser>(null);
        const [sendMessage, setMessage] = useState<string>();
        const match = useRouteMatch()
        const [messages, setMessages] = useState<{ content: string, fromSelf: boolean }[]>([]);

        useEffect(() => {
            const getUser = async () => {
                try {
                    const url = `http://localhost:8080/get-single-user/${match.params.id}`;

                    const response = await fetch(url);
                    const results = await response.json();
                    console.log(results);
                    if (results.success) {
                        setUser(results.user);
                    }
                } catch (e) {
                    console.log(e.message);
                }
            };
            getUser();

            return () => {
                setMessages([])
            }
        }, [match && match.params.id])

        useEffect(() => {
                socket.on("private message", ({ content, from }) => {
                    messages && setMessages([...messages, {content, fromSelf: false}])
                });
        }, [messages])

        const handleSend = () => {
            const sanitised = sendMessage?.split(' ').join('');
            if (user && sendMessage && sanitised && sanitised.length > 0) {
                socket.emit("private message", {
                    content: sendMessage,
                    to: user.userID
                });
                setMessages([...messages, {content: sendMessage, fromSelf: true}]);
                setMessage('');
            }
        }

        return (
            <>
                <p>Room {user && user.userID}</p>
                <div style={{display: 'flex', flexDirection: 'column', padding: '10px'}}>
                    {messages && messages.map(message => {
                        const color = message.fromSelf ? '#35b0f0' : 'grey';
                        const align = message.fromSelf ? '5px 0 5px auto' : '5px auto 5px 0';
                        return (
                            <div style={{backgroundColor: color, color: 'white', padding: '10px', borderRadius: '5px', textAlign: 'left', maxWidth: '70%', width: 'fit-content', margin: align}}>{message.content}</div>
                        );
                    })}
                </div>
                <div style={{margin: '100px auto 0', width: 'fit-content'}}>
                    <textarea value={sendMessage && sendMessage} onChange={(e) => setMessage(e.target.value)} style={{height: '50px', width: '300px'}}/>
                    <div style={{margin: 'auto 0 auto auto'}}>
                        <button onClick={handleSend} style={{float: 'right'}}>Send</button>
                    </div>
                </div>
            </>
        );
    }
    // ------------------------------------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            <Router>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 4fr'}}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    {users && users.map(user => <Link
                        style={{padding: '10px', textDecoration: 'none', color: '#1d8694', boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.15)', margin: '5px'}}
                        to={`/conversation/${user.userID}`}>
                        <span>{user.username}</span>
                    </Link>)}
                </div>
                <div style={{width: '300px', margin: 'auto'}}>
                    <div
                        style={{width: '300px', margin: 'auto', border: `2px solid ${connected}`, borderRadius: '5px'}}>
                        <Route path={'/'}>
                            <h1>ChatApp</h1>
                        </Route>
                        <Switch>
                            <Route exact path='/conversation/:id/'>
                                <Room />
                            </Route>
                        </Switch>
                    </div>
                </div>
                </div>
            </Router>
        </>
    );
}

export default Chat;