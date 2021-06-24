import React, {useEffect, useState} from 'react';
import socket from '../socket';
import Select from 'react-select';

interface IUser {
    hasNewMessages: boolean;
    self: boolean;
    userID: string;
    username: string;
}

const Chat = () => {

    const [users, setUsers] = useState<IUser[]>();
    const [selectedUserId, setSelectedUserId] = useState<string>();
    const [sendMessage, setMessage] = useState<string>();
    const [messageList, setMessageList] = useState<{content: string, fromSelf: boolean}[]>([]);

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
            const newUserList = users ? [...users] : [];
            console.log('new list', newUserList);
            newUserList.push(user);
            setUsers(newUserList);
    });

    const handleUserSelect = (e: any) => {
        setSelectedUserId(e.value);
    }

    const handleSend = () => {
        const sanitised = sendMessage?.split(' ').join('');
        if (selectedUserId && sendMessage && sanitised && sanitised.length > 0) {
            socket.emit("private message", {
                sendMessage,
                to: selectedUserId
            });
            const newMessageList = [...messageList];
            newMessageList.push({content: sendMessage, fromSelf: true})
            setMessageList(newMessageList);
        }
    }

    return (
        <>
        <div style={{width: '300px', margin: 'auto'}}>
            <div style={{width: '300px', margin: 'auto'}}>
                <Select onChange={handleUserSelect} options={users && users.map(user => {
                    if (user.self){
                        return {label: `${user.username} (you)`, value: user.userID}
                    }
                    return {label: user.username, value: user.userID}
                })} />
            </div>
            <div>
                {messageList.map(message => {
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
        </div>
        </>
    );
}

export default Chat;