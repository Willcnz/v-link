import React, { Component } from 'react';
import { useState, useEffect } from 'react';

import "../../themes.scss"
import './volvo.scss';

const electron = window.require('electron');
const { ipcRenderer } = electron;



const Volvo = ({ settings }) => {

	useEffect(() => {

        console.log("Settings: ", settings)

		return function cleanup() {

		};
	}, []);


	return (
	<div className={`volvo ${settings.colorTheme}`}>
	  <div className='volvo__header'>
        <h2>Car Settings</h2>
      </div>

      <div className='volvo__body'>
        <div className='volvo__container'>
        <div className='volvo__container__content'>

        <div className='volvo__container__section'>
            <div><h4>Performance Settings</h4></div>
            <div className='volvo__container__section__element'>
              <span>Enable Haldex</span>

              <span className='volvo__container__section__divider'></span>

              <span>  
                <input type='checkbox' onChange={console.log('Checked')} defaultChecked={false} />
              </span>
            </div>

            <div className='volvo__container__section__element'>
              <span>Deactivate ESP</span>

              <span className='volvo__container__section__divider'></span>

              <span>  
                <input type='checkbox' onChange={console.log('Checked')} defaultChecked={false} />
              </span>
            </div>
      	  </div>

          <div className='volvo__container__section'>
            <div><h4>Comfort Settings</h4></div>

            <div className='volvo__container__section__element'>
              <span>Turn On Cruise Control</span>

              <span className='volvo__container__section__divider'></span>

              <span>  
                <input type='checkbox' onChange={console.log('Checked')} defaultChecked={true} />
              </span>
            </div>

            <div className='volvo__container__section__element'>
              <span>Auto-close Windows</span>

              <span className='volvo__container__section__divider'></span>

              <span>  
                <input type='checkbox' onChange={console.log('Checked')} defaultChecked={true} />
              </span>
            </div>

            <div className='volvo__container__section__element'>
              <span>Auto-open Windows</span>

              <span className='volvo__container__section__divider'></span>

              <span>  
                <input type='checkbox' onChange={console.log('Checked')} defaultChecked={false} />
              </span>
            </div>
      	  </div>

          <div className='volvo__container__section'>
            <div><h4>Light Settings</h4></div>
            <div className='volvo__container__section__element'>
              <span>Activate Headlight</span>

              <span className='volvo__container__section__divider'></span>

              <span>  
                <input type='checkbox' onChange={console.log('Checked')} defaultChecked={false} />
              </span>
            </div>

            <div className='volvo__container__section__element'>
              <span>Activate Sidelights</span>

              <span className='volvo__container__section__divider'></span>

              <span>  
                <input type='checkbox' onChange={console.log('Checked')} defaultChecked={false} />
              </span>
            </div>

            <div className='volvo__container__section__element'>
              <span>Activate Foglights</span>

              <span className='volvo__container__section__divider'></span>

              <span>  
                <input type='checkbox' onChange={console.log('Checked')} defaultChecked={true} />
              </span>
            </div>

      	  </div>
        </div>
      </div>
    </div>
	</div>
	)
};

export default Volvo;