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

    return (
        <>
        <div>
            <Select options={users && users.map(user => {
                if (user.self){
                    return {label: `${user.username} (you)`, value: user.userID}
                }
                return {label: user.username, value: user.userID}
            })} />
        </div>
        </>
    );
}

export default Chat;