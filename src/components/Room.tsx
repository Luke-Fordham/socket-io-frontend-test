import React, {useContext, useEffect, useState} from "react";
import {useRouteMatch} from 'react-router-dom'
import socket from "../socket";
import {IUser} from "./Chat";
import {UserContext} from "../App";

const Room = () => {
    const {user, setUser} = useContext(UserContext);
    const [sendMessage, setMessage] = useState<string>();
    const match = useRouteMatch()
    const [messages, setMessages] = useState<{ content: string, fromSelf: boolean, from?: number }[]>([]);
    const [conversation, setConversation] = useState<any>();

    useEffect(() => {
        console.log(messages);
    }, [messages])

    useEffect(() => {
        console.log(conversation);
    }, [conversation])

    useEffect(() => {
        console.log(user)
    }, [user])

    useEffect(() => {
        const getConversation = async () => {
            try {
                const url = `http://localhost:3001/get-conversation/${match.params.id}`;
                const response = await fetch(url);
                const results = await response.json();
                console.log(results);
                if (results.success) {
                    setConversation(results.conversation);
                }
            } catch (e) {
                console.log(e.message);
            }
        };
        getConversation();

        socket.emit('join', match.params.id);

        return () => {
            setMessages([])
        }
    }, [match && match.params.id])

    useEffect(() => {
        if (messages) {
            socket.on("private message", ({ content, from }) => {
                setMessages([...messages, {content, fromSelf: false, from}])
            });
        }
    }, [messages])

    const handleSend = () => {
        const sanitised = sendMessage?.split(' ').join('');
        if (match.params.id && sendMessage && sanitised && sanitised.length > 0) {
            socket.emit("private message", {
                content: sendMessage,
                conversation: match.params.id,
                from: user.id
            });
            setMessages([...messages, {content: sendMessage, fromSelf: true, from: user.id}]);
            setMessage('');
        }
    }

    return (
        <>
            <p>{conversation && conversation.name}</p>
            <div style={{display: 'flex', flexDirection: 'column', padding: '10px'}}>
                {messages && messages.map((message, i) => {
                    const color = message.fromSelf ? '#35b0f0' : 'grey';
                    const align = message.fromSelf ? '5px 0 5px auto' : '5px auto 5px 0';
                    return (
                        <div style={{margin: align, display: 'flex', flexDirection: 'column'}}>
                        <div key={i} style={{backgroundColor: color, color: 'white', padding: '10px', borderRadius: '5px', textAlign: 'left', maxWidth: '70%', width: 'fit-content'}}>{message.content}</div>
                            <label style={{margin: 'auto', padding: '5px'}}>{conversation && conversation.members && conversation.members.find(user => user.id === message.from)?.username}</label>
                        </div>
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

export default Room;