import React, {CSSProperties, useContext, useEffect, useState} from "react";
import {useRouteMatch} from 'react-router-dom'
import socket from "../socket";
import {IUser} from "./Chat";
import {ModalContext, UserContext} from "../App";
import TinyEditor from "./TextInput/TinyMCE";
import gifIcon from '../assets/gif_icon.png';
import Modal from "./Modal";
import Select from "react-select";

const Room = () => {
    const {user, setUser} = useContext(UserContext);
    const [sendMessage, setMessage] = useState<string>();
    const match = useRouteMatch()
    const [messages, setMessages] = useState<{ content: string, fromSelf: boolean, from?: number }[]>([]);
    const [conversation, setConversation] = useState<any>();
    const {modal, setModal} = useContext(ModalContext);

    // useEffect(() => {
    //     console.log(messages);
    // }, [messages])
    //
    // useEffect(() => {
    //     console.log(conversation);
    // }, [conversation])
    //
    // useEffect(() => {
    //     console.log(user)
    // }, [user])
    //
    // useEffect(() => {
    //     console.log(sendMessage);
    // }, [sendMessage])

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
            socket.on("private message", ({content, from}) => {
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

    const sendGif = ({target}) => {
        setMessage(`<img src=${target.src} data-mce-src=${target.src}>`)
        setModal({show: false, content: <div></div>})
    }

    const getGifs = async () => {
        const query = 'minion';
        const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=cRHbfmbMXKzXYuHp2AdLFPTfXEGKvS7d&q=${query}&limit=10&offset=0&rating=g&lang=en`);
        const results = await response.json();
        results.data && setModal({
            show: true, content: (
                <div style={modalContentStyle}>
                    <div style={{position: 'relative', width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap'}}>
                        {results.data.map(gif => <img style={{cursor: 'pointer'}} src={gif.images.original.url} onClick={sendGif}/>)}
                    </div>
                </div>
            )
        })

    }

    const modalContentStyle: CSSProperties = {
        margin: '10% auto auto auto',
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        width: '40vw',
        height: '50vh',
        backgroundColor: 'white',
        position: 'absolute',
        zIndex: 101,
        borderRadius: '5px',
        overflowY: 'scroll'
    }


    return (
        <>
            <h2>{conversation && conversation.name}</h2>
            <div style={{display: 'flex', flexDirection: 'column', padding: '10px'}}>
                {messages && messages.map((message, i) => {
                    const color = message.fromSelf ? 'rgb(52 164 222)' : 'grey';
                    const align = message.fromSelf ? '5px 0 5px auto' : '5px auto 5px 0';
                    const alignLabel = message.fromSelf ? 'auto 0 auto auto' : 'auto auto auto 0';
                    return (
                        <div style={{margin: align, display: 'flex', flexDirection: 'column', maxWidth: '70%'}}>
                            <div key={i} style={{
                                backgroundColor: color,
                                color: 'white',
                                padding: '10px',
                                borderRadius: '5px',
                                textAlign: 'left',
                                width: 'fit-content',
                                boxShadow: 'rgb(0 0 0 / 24%) 0px 0px 5px 0px'
                            }} dangerouslySetInnerHTML={{__html: message.content}}>
                            </div>
                            <label style={{
                                margin: alignLabel,
                                padding: '5px',
                                fontSize: '12px'
                            }}>{conversation && conversation.members && conversation.members.find(user => user.id === message.from)?.username}</label>
                        </div>
                    );
                })}
            </div>
            <div style={{
                margin: '100px auto 0',
                width: 'fit-content',
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                paddingBottom: '20px',
                display: 'flex'
            }}>
                <div className={'gif-icon'} onClick={getGifs}>
                    <div style={{margin: 'auto'}}>
                        <img style={{width: '50%'}} src={gifIcon}/>
                    </div>
                </div>
                <div style={{height: '100px', width: '500px', backgroundColor: 'white', border: '1px solid #ccc'}}>
                    <TinyEditor data={sendMessage} change={(e) => setMessage(e)}/>
                </div>
                <div style={{margin: 'auto 0 auto auto'}}>
                    <button onClick={handleSend} style={{margin: 'auto 10px'}}>Send</button>
                </div>
            </div>
        </>
    );
}

export default Room;