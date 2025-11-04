import { IonContent, IonLabel, IonPage } from "@ionic/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import { listGalleries } from "../bin/Firebase";

import { BatteryMediumIcon } from "lucide-react";

import './Photos.css';

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Photos: React.FC = () => {
    const [galleries, setGalleries] = useState<any[]>([]);
    useEffect(() => {
        listGalleries().then((galleries) => {
            setGalleries(galleries);
        })
    }, []);

    return(
        <IonPage>
            <IonContent fullscreen className="photos-page">
                <Swiper modules={[Navigation]} navigation>
                    {galleries.map((gallery) => {
                        return(
                            <SwiperSlide key={gallery.id}>
                                <img 
                                    src={gallery.thumbnail.qhd} 
                                    alt={gallery.location}
                                />
                                <div className="photo-overlay">
                                    <div className="tl" />
                                    <div className="tr" />
                                    <div className="br" />
                                    <div className="bl" />
                                </div>
                                <div className="spotter">
                                    <div className="left-bracket" />
                                    <div className="center" />
                                    <div className="right-bracket" />
                                </div>
                                <BatteryMediumIcon size={50} strokeWidth={1.5} className="battery" />
                                <div className="description">
                                    <div className="left">
                                        <IonLabel className="title">`{gallery.title}'</IonLabel>
                                        <IonLabel className="location">{gallery.location}</IonLabel>
                                    </div>
                                </div>
                                <Link to={`/photos/${gallery.id}`} className="photo-link" />
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </IonContent>
        </IonPage>
    );
}

export default Photos;