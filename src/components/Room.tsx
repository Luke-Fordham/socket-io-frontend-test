import React, {useState, useEffect} from 'react';
import socket from "../socket";
import {IUser} from './Chat'

interface IProps {
    selectedUserId?: string;
    users?: IUser[];
}

const Room = () => {
    const [sendMessage, setMessage] = useState<string>();
    const [messageList, setMessageList] = useState<{content: string, fromSelf: boolean}[]>([]);

    const {selectedUserId, users} = props;

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

    socket.on("private message", ({ content, from }) => {
        users && users.forEach(user => {
            if (user.userID === from) {
                user.messages.push({
                    content,
                    fromSelf: false,
                });
                if (user !== this.selectedUser) {
                    user.hasNewMessages = true;
                }
                break;
            }
        })
        for (let i = 0; i < this.users.length; i++) {
            const user = this.users[i];
            if (user.userID === from) {
                user.messages.push({
                    content,
                    fromSelf: false,
                });
                if (user !== this.selectedUser) {
                    user.hasNewMessages = true;
                }
                break;
            }
        }
    });

    return (
        <>
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
        </>
    );
}

export default Room;