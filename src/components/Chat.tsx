import React, {CSSProperties, useEffect, useState} from 'react';
import socket from '../socket';
import {Link, Switch, Route, BrowserRouter as Router} from 'react-router-dom'
import Room from './Room';
import Select from "react-select";
import {UserOption} from "../App";

export interface IUser {
    hasNewMessages: boolean;
    self?: boolean;
    userID?: string;
    username: string;
    messages?: { content: string, fromSelf: boolean }[];
    connected?: boolean;
}

const Chat = () => {
    const [conversations, setConversations] = useState<any>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [userOptions, setUserOptions] = useState<UserOption[]>([]);
    const [addingMembers, setAddingMembers] = useState<UserOption[]>();
    const [newConvName, setNewConvName] = useState<string>(null);

    useEffect(() => {
        const pullUsers = async () => {
            const response = await fetch('http://localhost:3001/get-all-users');
            const results = await response.json();
            console.log(results);
            if (results.success) {
                setUserOptions(results.users.map(user => { return {value: user.id, label: user.username}}))
            }
        }
        pullUsers();
    }, [])

    useEffect(() => {
        socket.on('conversations', (e) => {
            setConversations(e);
        })
    }, [conversations])

    const addConversation = () => {
        if (addingMembers && addingMembers.length > 0){
            if (newConvName){
                const sanitised = newConvName?.split(' ').join('');
                if (!sanitised || sanitised && sanitised.length <= 0){
                    return;
                }
            }
            console.log({
                name: newConvName,
                members: addingMembers
            })
            socket.emit('new conversation', {
                name: newConvName,
                members: addingMembers
            })
            setShowModal(false);
        }
    }

    const modalBackground: CSSProperties = {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        backgroundColor: '#00000082',
        position: 'absolute',
        zIndex: 100
    }

    const modalContent: CSSProperties = {
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
        borderRadius: '5px'
    }

    return (
        <>
            <Router>
                {showModal &&
                    <>
                    <div style={modalContent}>
                        <div style={{position: 'relative', width: '100%', height: '100%'}}>
                            <div style={{width: '50%', margin: 'auto', padding: '20px 0'}} className={'form'}>
                                <div style={{padding: '20px'}}>
                                    <h3>New Conversation</h3>
                                </div>
                                <div>
                                    <input placeholder={'Conversation name'} style={{width: '100%'}} onChange={(e) => setNewConvName(e.target.value)}/>
                                </div>
                                <Select placeholder={'Select members...'} isMulti options={userOptions} onChange={(e: UserOption[]) => setAddingMembers(e)}/>
                            </div>
                            <button style={{display: 'block', margin: 'auto', position: 'absolute', bottom: '20px', right: '20px'}} onClick={addConversation}>
                                Add conversation
                            </button>
                        </div>
                    </div>
                    <div style={modalBackground} onClick={() => setShowModal(false)}>
                    </div>
                    </>
                }
                <div style={{display: 'grid', gridTemplateColumns: '1fr 4fr', height: '100%'}}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        border: '2px solid rgb(181 221 226)',
                        boxShadow: 'rgb(0 0 0 / 24%) 0px 0px 5px 0px',
                        padding: '5px',
                        borderRadius: '3px',
                        position: 'relative',
                        backgroundColor: '#f8f8f82b',
                    }}>
                        <div style={{padding: '15px 0'}}>
                            <h3>Conversations</h3>
                        </div>
                        {conversations && conversations.map(convo => <Link
                            style={{
                                padding: '10px',
                                textDecoration: 'none',
                                color: 'white',
                                boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.15)',
                                margin: '5px',
                                borderRadius: '3px',
                                backgroundImage: 'linear-gradient(344deg, rgba(42, 211, 241, 0.61), rgb(13 156 139 / 31%))',
                                backgroundColor: '#5dc2d4'
                            }}
                            to={`/conversation/${convo.id}`}>
                            <span><strong>{convo.name}</strong></span>
                        </Link>)}
                        <button style={{margin: '5px', position: 'absolute', bottom: '10px', right: '10px'}} onClick={() => setShowModal(true)}>New Conversation</button>
                    </div>
                    <div style={{width: '100%', margin: 'auto', height: '100%'}}>
                        <div
                            style={{margin: 'auto', borderRadius: '5px', padding: '20px', height: '100%', position: 'relative'}}>
                            <Route path={'/'}>
                            </Route>
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