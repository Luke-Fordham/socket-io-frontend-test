import React, {CSSProperties, useContext} from 'react';
import Select from "react-select";
import {ModalContext} from "../App";


const Modal = () => {
    const {modal, setModal} = useContext(ModalContext);

    const modalBackground: CSSProperties = {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        backgroundColor: '#00000082',
        position: 'absolute',
        zIndex: 100
    }

    return (
        <>
            {modal.content}
            <div style={modalBackground} onClick={() => setModal({
                show: false,
                content:
                    <React.Fragment>
                    </React.Fragment>
            })}>
            </div>
        </>
    );
}

export default Modal;