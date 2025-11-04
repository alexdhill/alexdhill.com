import { IonButton, IonContent, IonPage } from '@ionic/react';
import { useSettings } from '../bin/Settings';

import Menu from './Menu';
import Navigator from './Navigator';

import { PanelLeft } from 'lucide-react';

import './Viewport.css';

interface ContainerProps { }

const Viewport: React.FC<ContainerProps> = () => {
  const {theme, setTheme, menu, setMenu, progress, setProgress} = useSettings();
  return (
    <IonPage>
      <IonContent fullscreen className="container">
        <div className="viewport-columns">
          {menu &&
          <div className="menu-container">
            <Menu />
          </div>}
          <div className="content-container">
            <Navigator />
            {menu ||
            <IonButton icon-only className="menu-open" onClick={() => {setMenu!(true)}}>
              <PanelLeft size={20} strokeWidth={1.5} />
            </IonButton>}
          </div>
          <div className="progress-container">
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Viewport;
