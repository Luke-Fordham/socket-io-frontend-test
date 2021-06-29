import React, {useEffect, useState} from 'react';
import socket from '../socket';
import {Link, Switch, Route, BrowserRouter as Router} from 'react-router-dom'
import Room from './Room';

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

    return (
        <>
            <Router>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 4fr'}}>
                <div style={{display: 'flex', flexDirection: 'column', border: '2px solid rgb(181 221 226)', boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.15)', padding: '5px', borderRadius: '3px'}}>
                    <h3>Users</h3>
                    {users && users.map(user => <Link
                        style={{padding: '10px', textDecoration: 'none', color: '#1d8694', boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.15)', margin: '5px', borderRadius: '3px', border: '2px solid rgb(181 221 226)'}}
                        to={`/conversation/${user.userID}`}>
                        <span>{user.self ? `${user.username} (you)` : user.username}</span>
                    </Link>)}
                </div>
                <div style={{width: '100%', margin: 'auto'}}>
                    <div
                        style={{margin: 'auto', border: `2px solid ${connected}`, borderRadius: '5px', padding: '20px'}}>
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