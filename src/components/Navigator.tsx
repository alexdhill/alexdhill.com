import { IonRouterOutlet } from '@ionic/react';
import { Route, Redirect } from 'react-router';

import Home from '../pages/Home';
import Photos from '../pages/Photos';
import Gallery from '../pages/Gallery';

import './Navigator.css';

interface ContainerProps { }

const Navigator: React.FC<ContainerProps> = () => {
  return (
    <div className="navigator">
        <IonRouterOutlet>
            <Route exact path="/home">
                <Home />
            </Route>
            <Route exact path="/">
                <Redirect to="/home" />
            </Route>
            <Route exact path="/photos">
                <Photos />
            </Route>
            <Route path="/photos/:gallery">
                <Gallery />
            </Route>
        </IonRouterOutlet>
    </div>
  );
};

export default Navigator;
