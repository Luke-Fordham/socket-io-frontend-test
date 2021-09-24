import React, {CSSProperties, useContext, useEffect, useState} from 'react';
import socket from '../socket';
import {Link, Switch, Route, BrowserRouter as Router} from 'react-router-dom'
import Room from './Room';
import Select from "react-select";
import {ModalContext, UserContext, UserOption} from "../App";
import Modal from "./Modal";

export interface IUser {
    hasNewMessages: boolean;
    self?: boolean;
    userID?: string;
    username: string;
    messages?: { content: string, fromSelf: boolean }[];
    connected?: boolean;
}

const Chat = () => {
    const {user, setUser} = useContext(UserContext);
    const [conversations, setConversations] = useState<any>();
    const {modal, setModal} = useContext(ModalContext);
    const [userOptions, setUserOptions] = useState<UserOption[]>([]);
    const [selectedConv, setSelectedConv] = useState<number>();

    useEffect(() => {
        const pullUsers = async () => {
            const response = await fetch('http://localhost:3001/get-all-users');
            const results = await response.json();
            console.log(results);
            if (results.success) {
                const options = results.users.map(userOp => {
                    return {value: userOp.id, label: userOp.username}
                });
                options.shift();
                setUserOptions(options);
            }
        }
        pullUsers();
    }, [])

    useEffect(() => {
        socket.on('conversations', (e) => {
            setConversations(e);
        })
    }, [conversations])


    const Content = () => {
        const [newConvName, setNewConvName] = useState<string>(null);
        const [addingMembers, setAddingMembers] = useState<UserOption[]>();
        const addUserOption = (e: UserOption[]) => {
            setAddingMembers(e);
        }
        const addConversation = () => {
            const newArray = addingMembers ? [...addingMembers] : [];
            newArray.push({value: user.id, label: user.username});
            console.log(newArray);
            if (addingMembers && addingMembers.length > 0) {
                if (newConvName) {
                    console.log('here');
                    const sanitised = newConvName?.split(' ').join('');
                    if (!sanitised || sanitised && sanitised.length <= 0) {
                        return;
                    }
                }
                console.log({
                    name: newConvName,
                    members: newArray
                })
                socket.emit('new conversation', {
                    name: newConvName,
                    members: newArray
                })
                setModal({...modal, show: false});
            }
        }
        return (
            <div className={'modal-content'}>
                <div className={'pos-rel full-size'}>
                    <div className={'m-auto form'}>
                        <div style={{padding: '20px'}}>
                            <h3>New Conversation</h3>
                        </div>
                        <div>
                            <input placeholder={'Conversation name'}
                                   className={'full-size'}
                                   onChange={(e) => setNewConvName(e.target.value)}/>
                        </div>
                        <Select className={'react-select'} placeholder={'Select members...'} isMulti options={userOptions}
                                onChange={addUserOption}/>
                    </div>
                    <button className={'bottom-right m-auto'} onClick={addConversation}>
                        Add conversation
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            <Router>
                <div style={{display: 'grid', gridTemplateColumns: '30px 1fr 4fr', height: '100%'}}>
                    <div style={{gridColumnStart: 1, gridColumnEnd: 3, gridRow: 1, borderRadius: '0 0 20px 0', backgroundColor: '#655FAF'}}>
                    </div>
                    <div
                        className={'pos-rel flex flex-col white-background big-shadow'}
                        style={{
                        gridColumn: 2,
                        gridRow: 1,
                        borderRadius: '20px 0px 20px 0'
                    }}>
                        <div className={'flex flex-col'} style={{padding: '15px 0', height: '120px'}}>
                            <h2 className={'centered-text'}>Conversations</h2>
                        </div>
                        {conversations && conversations.map(convo => {
                            let name = '';
                            if (convo.id === selectedConv){
                                name = 'hover-background';
                            }
                            return (<Link
                                className={`conversation-link flex flex-col ${name}`}
                                onClick={() => {
                                    setSelectedConv(convo.id)
                                }}
                                to={`/conversation/${convo.id}`}>
                                <span className={'centered-text'}>{convo.name}</span>
                            </Link>);
                        })}
                        <button className={'bottom-right m-auto'}
                                onClick={() => setModal({show: true, content: <Content />})}>New Conversation
                        </button>
                    </div>
                    <div className={'m-auto full-size'}>
                        <div
                            className={'grid m-auto room-container pos-rel'}>
                            <Switch>
                                <Route exact path='/conversation/:id/'>
                                    <Room/>
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