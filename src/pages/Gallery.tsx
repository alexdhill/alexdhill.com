import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { IonPage, IonContent, IonImg } from "@ionic/react"
import { fetchGallery } from "../bin/Firebase";

import './Gallery.css';

const Gallery: React.FC = () => {

    const gallery = useParams<{gallery: string}>().gallery;
    const [photos, setPhotos] = useState<any[]>([]);

    useEffect(() => {
        fetchGallery(gallery).then((data) => {
            console.log(data);
            setPhotos(data);
        });
    }, [gallery]);

    return (
        <IonPage>
            <IonContent fullscreen className="photos-page">
                <div className="photo-grid">
                    {photos.map((photo, index) => (
                        <div className="photo-container" key={index} style={{width: `${photo.width/12*100}%`}}>
                            {/* <IonImg alt={photo.name} src={photo.fd} className="border" /> */}
                            <div className="border" />
                            <IonImg alt={photo.name} src={photo.fd} />
                        </div>
                    ))}
                </div>
            </IonContent>
        </IonPage>
    )
}

export default Gallery;