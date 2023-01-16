import React, { useState, useEffect } from 'react';
//import Carplay from 'react-js-carplay'
import Carplay from './Carplay'
import { useNavigate } from 'react-router-dom';


function CarplayWindow({ settings, setShowNav, socket, connected }) {
    const { ipcRenderer } = window;
    const navigate = useNavigate();

    const [status, setStatus] = useState(false);

    useEffect(() => {
        ipcRenderer.on('plugged', () => { setStatus(true); console.log('phone connected') });
        ipcRenderer.on('unplugged', () => { setStatus(false); /*console.log('disconnected')*/ });
        ipcRenderer.on('quitReq', () => { leaveCarplay() });

        ipcRenderer.send('statusReq');
        return () => {
            ipcRenderer.removeAllListeners();
        };
    }, []);

    useEffect(() => {
        if (status) {
            if (window.location.hash === '#/' || window.location.hash === '') {
                setShowNav(false);
            }
        } else {
            setShowNav(true);
        }
    }, [status]);

    const touchEvent = (type, x, y) => {
        ipcRenderer.send('click', { type: type, x: x, y: y });
    };

    function leaveCarplay() {
        setShowNav(true);
        navigate('/dashboard');
        console.log('leaving carplay');
    }

    return (
        <div style={{width: '100%', height: '100%'}}>
	{connected ? <Carplay
            touchEvent={touchEvent}
            ws={socket}
            type={'ws'}
            settings={settings}
            status={status}

            /* react-js-carplay dependent */
            //openModal={false}
            //changeSetting={changeValue}
        /> : <div></div>}
	</div>
    );
}

export default CarplayWindow;