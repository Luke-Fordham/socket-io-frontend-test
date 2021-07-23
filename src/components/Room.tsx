import React, {useEffect, useState} from "react";
import {useRouteMatch} from 'react-router-dom'
import socket from "../socket";
import {IUser} from "./Chat";

const Room = () => {
    const [user, setUser] = useState<IUser>(null);
    const [sendMessage, setMessage] = useState<string>();
    const match = useRouteMatch()
    const [messages, setMessages] = useState<{ content: string, fromSelf: boolean }[]>([]);

    useEffect(() => {
        console.log(messages);
    }, [messages])

    useEffect(() => {
        // const getMessages = async () => {
        //     try {
        //         const url = `http://localhost:8080/get-messages/${match.params.id}`;
        //
        //         const response = await fetch(url);
        //         const results = await response.json();
        //         console.log(results);
        //         if (results.success) {
        //             setMessages(results.user);
        //         }
        //     } catch (e) {
        //         console.log(e.message);
        //     }
        // };
        // getUser();

        socket.emit('join', match.params.id);

        return () => {
            setMessages([])
        }
    }, [match && match.params.id])

    useEffect(() => {
        if (messages) {
            socket.on("private message", ({ content, from }) => {
                setMessages([...messages, {content, fromSelf: false}])
            });
        }
    }, [messages])

    const handleSend = () => {
        const sanitised = sendMessage?.split(' ').join('');
        if (match.params.id && sendMessage && sanitised && sanitised.length > 0) {
            socket.emit("private message", {
                content: sendMessage,
                conversation: match.params.id
            });
            setMessages([...messages, {content: sendMessage, fromSelf: true}]);
            setMessage('');
        }
    }

    return (
        <>
            <p>Room {user && user.userID}</p>
            <div style={{display: 'flex', flexDirection: 'column', padding: '10px'}}>
                {messages && messages.map((message, i) => {
                    const color = message.fromSelf ? '#35b0f0' : 'grey';
                    const align = message.fromSelf ? '5px 0 5px auto' : '5px auto 5px 0';
                    return (
                        <>
                        <div key={i} style={{backgroundColor: color, color: 'white', padding: '10px', borderRadius: '5px', textAlign: 'left', maxWidth: '70%', width: 'fit-content', margin: align}}>{message.content}</div>
                            <label>{message.fromSelf.toString()}</label>
                        </>
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