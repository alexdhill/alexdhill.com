import { IonButton, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import { CameraIcon, HazeIcon, HouseIcon, MicroscopeIcon, MoonStarIcon, PanelLeftClose, SunIcon } from 'lucide-react';
import { useSettings } from '../bin/Settings';

import './Menu.css';

const Menu: React.FC = () => {
  const {theme, setTheme, menu, setMenu, progress, setProgress} = useSettings();

  return (
    <IonList lines="none" className="menu">
        <IonListHeader>
            <IonButton icon-only onClick={() => {setMenu!(false)}}>
                <PanelLeftClose size={20} strokeWidth={1.5} />
            </IonButton>
            <div className="menu-header-gap">
                <div className="fun-text">
                    <span className="jiggle">a</span>
                    <span className="jiggle">l</span>
                    <span className="jiggle">e</span>
                    <span className="jiggle">x</span>
                </div>
            </div>
            <IonButton icon-only onClick={() => {setTheme!((theme: string) => {
                if (theme === 'light') return 'dark';
                if (theme === 'dark') return 'warm';
                return 'light';
            })}}>
                {
                    theme === 'light' ? <SunIcon size={20} strokeWidth={1.5} /> :
                    theme === 'dark' ? <MoonStarIcon size={20} strokeWidth={1.5} /> :
                    <HazeIcon size={20} strokeWidth={1.5} />
                }
            </IonButton>
        </IonListHeader>
        <IonItem button routerLink="/home" className="menu-button">
            <HouseIcon size={18} strokeWidth={1.5} />
            <IonLabel>Home</IonLabel>
        </IonItem>
        <IonItem button routerLink="/photos" className="menu-button">
            <CameraIcon size={18} strokeWidth={1.5} />
            <IonLabel>Photos</IonLabel>
        </IonItem>
        {/* <IonItem button routerLink="/research" className="menu-button">
            <MicroscopeIcon size={18} strokeWidth={1.5} />
            <IonLabel>Research</IonLabel>
        </IonItem> */}
    </IonList>
  );
};

export default Menu;
