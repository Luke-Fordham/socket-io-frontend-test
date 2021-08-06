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
    const [addingMembers, setAddingMembers] = useState<UserOption[]>();
    const [newConvName, setNewConvName] = useState<string>(null);
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
        console.log("OPTIONS", addingMembers)
    }, [addingMembers])

    useEffect(() => {
        socket.on('conversations', (e) => {
            setConversations(e);
        })
    }, [conversations])

    const addConversation = () => {
        const newArray = [...addingMembers];
        newArray.push({value: user.id, label: user.username});
        if (addingMembers && addingMembers.length > 0) {
            if (newConvName) {
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

    const addUserOption = (e: UserOption[]) => {
        setAddingMembers(e);
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
        borderRadius: '5px'
    }

    const modalContent = (
        <div style={modalContentStyle}>
            <div style={{position: 'relative', width: '100%', height: '100%'}}>
                <div style={{width: '50%', margin: 'auto', padding: '20px 0'}} className={'form'}>
                    <div style={{padding: '20px'}}>
                        <h3>New Conversation</h3>
                    </div>
                    <div>
                        <input placeholder={'Conversation name'} style={{width: '100%'}}
                               onChange={(e) => setNewConvName(e.target.value)}/>
                    </div>
                    <Select placeholder={'Select members...'} isMulti options={userOptions}
                            onChange={addUserOption}/>
                </div>
                <button style={{
                    display: 'block',
                    margin: 'auto',
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px'
                }} onClick={addConversation}>
                    Add conversation
                </button>
            </div>
        </div>
    )

    return (
        <>
            <Router>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 4fr', height: '100%'}}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        backgroundColor: '#fcfcfc',
                        borderLeft: '20px #5dc2d4 solid'
                    }}>
                        <div style={{padding: '15px 0', height: '120px', display: 'flex', flexDirection: 'column'}}>
                            <h2 className={'centered-text'}>Conversations</h2>
                        </div>
                        {conversations && conversations.map(convo => {
                            let color = '';
                            if (convo.id === selectedConv){
                                color = '#5252521f';
                            }
                            return (<Link
                                className={'conversation-link'}
                                onClick={() => {
                                    setSelectedConv(convo.id)
                                }}
                                style={{
                                    padding: '10px',
                                    textDecoration: 'none',
                                    boxShadow: 'rgb(0 0 0 / 7%) 0px 2px 4px 0px',
                                    height: '80px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: color
                                }}
                                to={`/conversation/${convo.id}`}>
                                <span className={'centered-text'}>{convo.name}</span>
                            </Link>);
                        })}
                        <button style={{margin: '5px', position: 'absolute', bottom: '20px', right: '20px'}}
                                onClick={() => setModal({show: true, content: modalContent})}>New Conversation
                        </button>
                    </div>
                    <div style={{width: '100%', margin: 'auto', height: '100%'}}>
                        <div
                            style={{
                                margin: 'auto',
                                borderRadius: '5px',
                                height: '100%',
                                position: 'relative',
                                display: 'grid',
                                gridTemplateRows: '120px 1fr'
                            }}>
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