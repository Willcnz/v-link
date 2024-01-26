import { ApplicationSettings, Store } from '../store/Store';


import "./../../styles.scss"
import "./../../themes.scss"

const NavBar = () => {

	const applicationSettings = ApplicationSettings((state) => state.applicationSettings);
	const store = Store((state) => state);
	const updateStore = Store((state) => state.updateStore);

	const gradientId = 'gradient';

	return (
		<div className={`navbar ${applicationSettings.app.colorTheme.value}`} style={{
			height: `${applicationSettings.side_bars.navBarHeight.value}px`,
			display: 'flex',
			position: 'absolute',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			bottom: 0,
			width: '100%',
			background: 'var(--background-color)'
		}}>
			<div className="row">
				<svg height="2" width="100%">
					<defs>
						<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="black" stopOpacity="1" />
							<stop offset="33%" stopColor="var(--boxColorDefault)" stopOpacity="1" />
							<stop offset="66%" stopColor="var(--boxColorDefault)" stopOpacity="1" />
							<stop offset="100%" stopColor="black" stopOpacity="1" />
						</linearGradient>
					</defs>

					<rect
						width="100%"
						height="2"
						style={{ fill: `url(#${gradientId})` }}
					/>
				</svg>
			</div>
			<div className="row">
				<div className="column">
						<button className="nav-button" onClick={() => updateStore({ view: 'Dashboard' })} style={{ fill: (store.view === 'Dashboard') ? 'var(--themeDefault)' : 'var(--boxColorLighter)' }}>
							<svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width={(applicationSettings.side_bars.navBarHeight.value * 0.6)} height={(applicationSettings.side_bars.navBarHeight.value * 0.6)}>
								<use xlinkHref="/assets/svg/gauge.svg#gauge"></use>
							</svg>
						</button>
				</div>
				<div className="column">
					<button className="nav-button" onClick={() => updateStore({ view: 'Carplay' })} style={{ fill: (store.view === 'Carplay') ? 'var(--themeDefault)' : 'var(--boxColorLighter)' }}>
						<svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width={(applicationSettings.side_bars.navBarHeight.value * 0.6)} height={(applicationSettings.side_bars.navBarHeight.value * 0.6)}>
							<use xlinkHref="/assets/svg/carplay.svg#carplay"></use>
						</svg>
					</button>
				</div>
				<div className="column">
					<button className="nav-button" onClick={() => updateStore({ view: 'Settings' })} style={{ fill: (store.view === 'Settings') ? 'var(--themeDefault)' : 'var(--boxColorLighter)' }}>
						<svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width={(applicationSettings.side_bars.navBarHeight.value * 0.6)} height={(applicationSettings.side_bars.navBarHeight.value * 0.6)}>
							<use xlinkHref="/assets/svg/settings.svg#settings"></use>
						</svg>
					</button>
				</div>
			</div>

		</div >
	);
};


export default NavBar;
