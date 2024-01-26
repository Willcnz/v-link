/* eslint-disable no-case-declarations */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { findDevice, requestDevice, DongleConfig, CommandMapping } from 'node-carplay/web'

import { CarPlayWorker, KeyCommand } from './worker/types'
import { useCarplayTouch } from './useCarplayTouch'
import { InitEvent } from './worker/render/RenderEvents'
import useCarplayAudio from './useCarplayAudio'

import { RotatingLines } from 'react-loader-spinner'
import { ApplicationSettings, Store } from '../store/Store';

import "./../../styles.scss"
import "./../../themes.scss"

const videoChannel = new MessageChannel()
const micChannel = new MessageChannel()

function Carplay() {

  const applicationSettings = ApplicationSettings((state) => state.applicationSettings);
  const store = Store((state) => state);
  const updateStore = Store((state) => state.updateStore);

  const RETRY_DELAY_MS = 30000

  const width = store.carplaySize.width;
  const height =  store.carplaySize.height;

  const config: Partial<DongleConfig> = {
    width,
    height,
    fps: 60,
    mediaDelay: 300,
    phoneWorkMode: 2, // 2 for Carplay, 5 for Android
  }

  const [isPlugged, setIsPlugged] = useState(false)
  const [deviceFound, setDeviceFound] = useState<Boolean | null>(null)

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null,
  )

  const renderWorker = useMemo(() => {
    if (!canvasElement) return;

    const worker = new Worker(
      new URL('./worker/render/Render.worker.ts', import.meta.url), {
      type: 'module'
    }
    )
    const canvas = canvasElement.transferControlToOffscreen()
    // @ts-error
    worker.postMessage(new InitEvent(canvas, videoChannel.port2), [
      canvas,
      videoChannel.port2,
    ])
    return worker
  }, [canvasElement]);

  useLayoutEffect(() => {
    if (canvasRef.current) {
      setCanvasElement(canvasRef.current)
    }
  }, [])

  const carplayWorker = useMemo(() => {
    const worker = new Worker(
      new URL('./worker/CarPlay.worker.ts', import.meta.url), {
      type: 'module'
    }
    ) as CarPlayWorker
    const payload = {
      videoPort: videoChannel.port1,
      microphonePort: micChannel.port1,
    }
    worker.postMessage({ type: 'initialise', payload }, [
      videoChannel.port1,
      micChannel.port1,
    ])
    return worker
  }, [])

  const { processAudio, getAudioPlayer, startRecording, stopRecording } =
    useCarplayAudio(carplayWorker, micChannel.port2)

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  // subscribe to worker messages
  useEffect(() => {
    carplayWorker.onmessage = ev => {
      const { type } = ev.data
      switch (type) {
        case 'plugged':
          setIsPlugged(true)
          updateStore({phoneState: true})
          break
        case 'unplugged':
          setIsPlugged(false)
          updateStore({phoneState: false})
          updateStore({carplayState: false})
          break
        case 'requestBuffer':
          clearRetryTimeout()
          getAudioPlayer(ev.data.message)
          break
        case 'audio':
          clearRetryTimeout()
          processAudio(ev.data.message)
          break
        case 'media':
          //TODO: implement
          break
        case 'command':
          const {
            message: { value },
          } = ev.data
          switch (value) {
            case CommandMapping.startRecordAudio:
              startRecording()
              break
            case CommandMapping.stopRecordAudio:
              stopRecording()
              break
            case CommandMapping.requestHostUI:
              console.log("minimizing carplay")
              updateStore({view: "Dashboard"})
          }
          break
        case 'failure':
          if (retryTimeoutRef.current == null) {
            console.error(
              `Carplay initialization failed -- Reloading page in ${RETRY_DELAY_MS}ms`,
            )
            retryTimeoutRef.current = setTimeout(() => {
              window.location.reload()
            }, RETRY_DELAY_MS)
          }
          break
      }
    }
  }, [
    carplayWorker,
    clearRetryTimeout,
    getAudioPlayer,
    processAudio,
    renderWorker,
    startRecording,
    stopRecording,
  ])

  const checkDevice = useCallback(
    async (request: boolean = false) => {
      const device = request ? await requestDevice() : await findDevice()
      if (device) {
        setDeviceFound(true)
        const payload = {
          config,
        }
        carplayWorker.postMessage({ type: 'start', payload })
      } else {
        setDeviceFound(false)
      }
    },
    [carplayWorker],
  )

  // usb connect/disconnect handling and device check
  useEffect(() => {
    navigator.usb.onconnect = async () => {
      checkDevice()
    }

    navigator.usb.ondisconnect = async () => {
      const device = await findDevice()
      if (!device) {
        carplayWorker.postMessage({ type: 'stop' })
        setDeviceFound(false)
      }
    }

    checkDevice()
  }, [carplayWorker, checkDevice])

  const onClick = useCallback(() => {
    checkDevice(true)
  }, [checkDevice])

  const sendTouchEvent = useCarplayTouch(carplayWorker, width, height)

  const isLoading = !isPlugged

  const handleKeyBindings = useCallback((event: KeyboardEvent) => {
    console.log(event.code);
    if (Object.values(applicationSettings!.keyBindings).includes(event.code)) {
      let action = Object.keys(applicationSettings!.keyBindings).find(key =>
        applicationSettings!.keyBindings[key] === event.code
      )
      if (action !== undefined) {
        console.log(`Matched ${event.code} to ${action}`);
        const command: KeyCommand = action as KeyCommand
        carplayWorker.postMessage({ type: 'keyCommand', command })
      }
    }
  }, [applicationSettings]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyBindings);

    return () => {
      document.removeEventListener('keydown', handleKeyBindings);
    };
  }, [handleKeyBindings]);

  return (
    <div
      style={{ height: '100%', width: '100%', touchAction: 'none', overflow: 'hidden' }}
      id={'main'}
      className={`app ${applicationSettings.app.colorTheme.value}`}
    >
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: store.view === "Carplay" ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {deviceFound === false && (

            <div style={{
              color: "var(--textColorDefault)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div className="column">
                <h3>Connect phone or click to pair dongle.</h3>
                <p/>
                <button className="button-styles nav-button" onClick={onClick} style={{ fill: 'var(--boxColorLighter)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" height={"25px"} width={"100px"}>
                    <use xlinkHref="/assets/svg/link.svg#link"></use>
                  </svg>
                </button>
              </div>

            </div>
          )}
          {deviceFound === true && (
            <RotatingLines
              strokeColor="grey"
              strokeWidth="5"
              animationDuration="0.75"
              width="96"
              visible={true}
            />
          )}
        </div>
      )}
      <div
        id="videoContainer"
        onPointerDown={sendTouchEvent}
        onPointerMove={sendTouchEvent}
        onPointerUp={sendTouchEvent}
        onPointerCancel={sendTouchEvent}
        onPointerOut={sendTouchEvent}
        style={{
          height: height,
          display: store.view === "Carplay" ? 'flex' : 'none',
          width: width,
          padding: 0,
          margin: 0,
          marginTop: applicationSettings.side_bars.topBarAlwaysOn.value ? applicationSettings.side_bars.topBarHeight.value : 0,
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          id="video"
          style={
            isPlugged && store.view === "Carplay"
              ? { height: '100%', overflow: 'hidden' }
              : { display: 'none' }
          }
        />
      </div>
    </div>
  )
}

export default Carplay