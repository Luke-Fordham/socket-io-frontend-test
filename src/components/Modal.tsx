import React, {CSSProperties, useContext} from 'react';
import Select from "react-select";
import {ModalContext} from "../App";


const Modal = () => {
    const {modal, setModal} = useContext(ModalContext);


    return (
        <>
            {modal.content}
            <div className={'modal-background'} onClick={() => setModal({
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