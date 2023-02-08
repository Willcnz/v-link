import ReactDOM from "react-dom";
import Keyboard from 'react-simple-keyboard';
import "react-simple-keyboard/build/css/index.css";
import { GooSpinner } from "react-spinners-kit";
import React, { useRef, useState, useEffect } from "react";

import './wifiModal.scss';

const WifiModal = ({ isShowing, ssid, hide, connect, status, reset, settings }) => {

    const keyboard = useRef();

    const [isConnecting, setIsConnecting] = useState(false);
    const [message, setMessage] = useState(ssid);
    const [input, setInput] = useState("password");
    const [layout, setLayout] = useState("default");

    useEffect(() => {
            setMessage(ssid);
    }, [ssid]);

    useEffect(() => {
        changeStatus();
    }, [status]);


    const onChange = input => {
        setInput(input);
        console.log("Input changed", input);
    };

    const handleShift = () => {
        const newLayoutName = layout === "default" ? "shift" : "default";
        setLayout(newLayoutName);
    };

    const onKeyPress = button => {
        console.log("Button pressed", button);
        //If you want to handle the shift and caps lock buttons
        if (button === "{shift}" || button === "{lock}") handleShift();
    };

    const onChangeInput = event => {
        const input = event.target.value;
        setInput(input);
        keyboard.current.setInput(input);
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        connect(input);
        setIsConnecting(true);
    }

    function changeStatus() {
        setMessage(status);
        setIsConnecting(false);
    }

    function clear() {
        setMessage(ssid);
        setInput("password");
        setIsConnecting(false);
    }

    function close() {
        clear();
        reset();
        hide();
    }

    return ReactDOM.createPortal(
        <>
            {isShowing ?
            <div className={`container ${settings.colorTheme}`}>
                <React.Fragment>
                    <div className="modal-overlay" />
                    <div className="modal-wrapper" aria-modal aria-hidden tabIndex={-1} role="dialog">
                        <div className="modal">
                            <div className="modal__body">
                                <div className="modal__header">
                                    {isConnecting ?
                                        <div className="spinner">
                                            <h3>Connecting...</h3>
                                            <GooSpinner size={20} color="var(--textColor)" />
                                        </div> :
                                        <div>
                                            <h3>{message}</h3>
                                        </div>}
                                </div>
                                <form onSubmit={handleSubmit}>
                                <div className="modal__form">
                                    <div className="modal__form__inputContainer">
                                                <input onClick={(e) => setInput("")} onChange={onChangeInput} value={input} type="text" name="password" id="password" />
                                        
                                    </div>
                                    <div className="modal__form__buttonContainer">
                                        <input type="submit" value="Connect" className="button" />
                                        <input type="button" value="Close" className="button" onClick={close} />
                                    </div>

                                </div>
                                </form>
                            </div>
                        </div>
                        <div className="keyboard">
                            <Keyboard
                                keyboardRef={r => (keyboard.current = r)}
                                layoutName={layout}
                                onChange={onChange}
                                onKeyPress={onKeyPress}
                            />
                        </div>
                    </div>
                </React.Fragment>
                </div>
                : null
            }
        </>, document.getElementById("modal")
    );
};

export default WifiModal;
