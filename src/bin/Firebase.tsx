import { initializeApp } from 'firebase/app';
import { getFirestore, doc, Timestamp, getDoc } from 'firebase/firestore';

export interface PhotoThumbnail {
    title: string;
    id: string;
    date: Timestamp;
    location: string;
    thumbnail: {
        sd: string;
        fd: string;
        hd: string;
        qhd: string;
        uhd: string;
    };
}

export interface Photo {
    name: string;
    sd: string;
    fd: string;
    hd: string;
    qhd: string;
    uhd: string;
    width: number;
}

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG!);
const firebaseApp = initializeApp(firebaseConfig);

const database = getFirestore(firebaseApp);

const listGalleries = async () => {
    let galleries: PhotoThumbnail[] = [];
    const snapshot = await getDoc(doc(database, 'pages', 'photos'))
    if (snapshot.exists() && snapshot.data()) {
        galleries = snapshot.data().galleries;
        galleries.sort((a: any, b: any) => b.date.seconds - a.date.seconds);
    }
    return galleries;
}

const fetchGallery = async (id: string) => {
    let gallery: Photo[] = [];
    const snapshot = await getDoc(doc(database, 'pages', 'galleries'))
    if (snapshot.exists() && snapshot.data() && snapshot.data()[id]) {
        gallery = snapshot.data()[id];
    }
    return gallery;
}

const getImageUrl = (image: any, width: number) => {
    console.log(width, image);
    if (width < 720) return image.sd;
    else if (width < 1080) return image.fd;
    else if (width < 1440) return image.hd;
    else if (width < 1920) return image.qhd;
    else return image.uhd;
}

export {
    listGalleries,
    fetchGallery,
    getImageUrl
}