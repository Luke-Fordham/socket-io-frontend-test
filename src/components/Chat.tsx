import React, {useEffect, useState} from 'react';
import socket from '../socket';
import Select from 'react-select';
import {Simulate} from "react-dom/test-utils";

export interface IUser {
    hasNewMessages: boolean;
    self?: boolean;
    userID?: string;
    username: string;
    messages?: {content: string, fromSelf: boolean}[];
    connected?: boolean;
}

const Chat = () => {

    const [users, setUsers] = useState<IUser[]>();
    const [selectedUser, setSelectedUser] = useState<IUser>();

    useEffect(() => {
        users && console.log("USERS: \n", users);
    }, [users])

    const initReactiveProperties = (user: IUser) => {
        user.hasNewMessages = false;
    };

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
            console.log(user);
            const newUserList = users ? [...users] : [];
            console.log('new list', newUserList);
            newUserList.push(user);
            setUsers(newUserList);
    });

    const handleUserSelect = (e: any) => {
        setSelectedUser(e.value);
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------
    const Room = () => {
        const [sendMessage, setMessage] = useState<string>();

        useEffect(() => {
        }, [selectedUser])


        const handleSend = () => {
            const sanitised = sendMessage?.split(' ').join('');
            if (selectedUser && sendMessage && sanitised && sanitised.length > 0) {
                socket.emit("private message", {
                    sendMessage,
                    to: selectedUser.userID
                });
                const updateUserMessage = {...selectedUser}
                updateUserMessage.messages.push({content: sendMessage, fromSelf: true});
                setSelectedUser(updateUserMessage);

            }
        }


        return (
            <>
                <div>
                    {selectedUser?.messages?.map(message => {
                        let color = 'grey';
                        if (message.fromSelf) color = '#35b0f0';
                        return (
                            <div style={{backgroundColor: color, color: 'white', padding: '10px'}}>{message.content}</div>
                        );
                    })}
                </div>
                <div style={{margin: '100px auto 0', width: 'fit-content'}}>
                    <textarea onChange={(e) => setMessage(e.target.value)} style={{height: '50px', width: '300px'}}/>
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
        <div style={{width: '300px', margin: 'auto'}}>
            <div style={{width: '300px', margin: 'auto'}}>
                <Select onChange={handleUserSelect} options={users && users.map(user => {
                    if (user.self){
                        return {label: `${user.username} (you)`, value: user}
                    }
                    return {label: user.username, value: user}
                })} />
            </div>
            <Room />
        </div>
        </>
    );
}

export default Chat;