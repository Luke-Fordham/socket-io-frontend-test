import React, {CSSProperties, useContext, useEffect, useRef, useState} from "react";
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
    const [messages, setMessages] = useState<{ content: string, fromSelf: boolean, from?: number, time?: string }[]>([]);
    const [conversation, setConversation] = useState<any>();
    const {modal, setModal} = useContext(ModalContext);

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
            socket.on("private message", ({content, from, time}) => {
                setMessages([...messages, {content, fromSelf: false, from, time}])
            });
        }
    }, [messages])

    const handleSend = () => {
        const date = new Date();
        const timestamp = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
        const sanitised = sendMessage?.split(' ').join('');
        if (match.params.id && sendMessage && sanitised && sanitised.length > 0) {
            socket.emit("private message", {
                content: sendMessage,
                conversation: match.params.id,
                from: user.id,
                time: timestamp
            });
            setMessages([...messages, {content: sendMessage, fromSelf: true, from: user.id, time: timestamp}]);
            setMessage('');
        }
    }

    const sendGif = ({target}) => {
        setMessage(`<img src=${target.src} data-mce-src=${target.src}>`)
        setModal({show: false, content: <div></div>})
    }

    const getGifs = async () => {
        setModal({
            show: true,
            content: <ModalContent content={null} />
        })
    }


    const search = async (query) => {
        const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=cRHbfmbMXKzXYuHp2AdLFPTfXEGKvS7d&q=${query}&limit=25&offset=0&rating=g&lang=en`);
        const results = await response.json();
        results.data && setModal({
            show: true, content: <ModalContent content={
                results.data.map(gif => <div style={{flexGrow: 2}}>
                        <img loading={'lazy'}
                             className={'pointer full-size'}
                             style={{objectFit: 'cover'}}
                             src={gif.images.original.url}
                             onClick={sendGif}/>
                    </div>
                )
            } />
        })
    }

    const ModalContent = ({content}) => {
        let query = '';
        return (
            <div className={'modal-content scroll'}>
                <div
                    className={'pos-rel full-size flex flex-wrap'}>
                    <div className={'search-left-fixed flex'}>
                        <input autoFocus style={{flexGrow: 2, marginRight: '5px'}} placeholder={'Search...'}
                               onChange={(e) => query = e.target.value}/>
                        <button onClick={() => search(query)}>search</button>
                    </div>
                    {content && content}
                </div>
            </div>
        )
    }


    return (
        <>
            <div
                className={'flex flex-col m-auto white-background conv-title'}
                >
                <h2 className={'m-auto'}>{conversation && conversation.name}</h2>
            </div>
            <div className={'flex flex-col'} style={{padding: '30px'}}>
                {messages && messages.map((message, i) => {
                    const name = message.fromSelf ? 'accent-background' : 'grey-background';
                    const align = message.fromSelf ? '5px 0 5px auto' : '5px auto 5px 0';
                    const alignLabel = message.fromSelf ? 'right' : 'left';
                    return (
                        <div
                            className={'flex flex-col'}
                            style={{margin: align, maxWidth: '70%'}}>
                            <div key={i}
                                 className={`message ${name} ${alignLabel}`}
                                 dangerouslySetInnerHTML={{__html: message.content}}>
                            </div>
                            <label style={{
                                margin: alignLabel,
                                padding: '5px',
                                fontSize: '12px'
                            }}>{conversation && conversation.members && conversation.members.find(user => user.id === message.from)?.username}: {message.time && message.time}</label>
                        </div>
                    );
                })}
            </div>
            <div className={'message-input flex pos-ab'}>
                <div id={'mytoolbar'} style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly'}}>
                <div className={'gif-icon'} onClick={getGifs}>
                    <div className={'white-background full-size m-auto flex'} style={{borderRadius: '7px', border: '#d4d4d4 1px solid'}}>
                        <img style={{width: '24px', margin: 'auto'}} src={gifIcon}/>
                    </div>
                </div>
                </div>
                <div
                    className={'tinyMCE-wrapper'}
                >
                    <TinyEditor data={sendMessage} change={(e) => setMessage(e)}/>
                </div>
                <div className={'right'}>
                    <button onClick={handleSend} style={{margin: 'auto 10px'}}>Send</button>
                </div>
            </div>
        </>
    );
}

export default Room;