import { useState } from 'react';
import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { renderToStaticMarkup } from 'react-dom/server';
import { SettingsProvider, SettingsType } from './bin/Settings';

import Viewport from './components/Viewport';

import { MousePointer2Icon, MousePointerClickIcon, PointerIcon } from 'lucide-react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
// import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import './App.css';

setupIonicReact({
  rippleEffect: false,
  mode: 'md'
});

const App: React.FC = () => {

  const [theme, setTheme] = useState<'light' | 'dark' | 'warm'>(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [menu, setMenu] = useState<boolean>(false);
  const [progress, setProgress] = useState<boolean | number>(false);

  const settings: SettingsType = {
    theme: theme,
    setTheme: setTheme,
    menu: menu,
    setMenu: setMenu,
    progress: progress,
    setProgress: setProgress
  }

  return (
    <IonApp
      className={theme === 'light' ? '' : theme === 'dark' ? 'dracula' : 'alucard'}
      style={{
        cursor: `url("data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(<MousePointer2Icon size={20} fill="black" color="white" filter="url(#handdrawn-animated)" />))}") 0 0, auto`,
        '--cursor-icon': `url("data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(<MousePointer2Icon size={20} fill="black" color="white"  filter="url(#handdrawn-animated)" />))}") 0 0, auto`,
        '--cursor-click': `url("data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(<MousePointerClickIcon size={20} fill="black" color="white"  filter="url(#handdrawn-animated)" />))}") 0 0, auto`,
        '--cursor-point': `url("data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(<PointerIcon size={20} color="black" fill="white"  filter="url(#handdrawn-animated)" />))}") 4 0, auto`,
      }}
    >
      <IonReactRouter>
        <SettingsProvider value={settings}>
          <Viewport />
        </SettingsProvider>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
