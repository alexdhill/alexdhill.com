import { useEffect, useRef, useState } from 'react';
import { IonAccordion, IonAccordionGroup, IonContent, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToast} from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Timestamp } from 'firebase/firestore';

import { useSettings } from '../bin/Settings';
import { listGalleries, PhotoThumbnail } from '../bin/Firebase';
import Calendar from '../components/Calendar';

import { CableIcon, CalendarDaysIcon, ChevronDownIcon, CopyrightIcon, FullscreenIcon, TestTubeDiagonalIcon } from 'lucide-react';

import './Home.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const {theme, setTheme, menu, setMenu, progress, setProgress} = useSettings();

  const [galleries, setGalleries] = useState<PhotoThumbnail[]>([{
    id: '', title: 'Yosemite National Park', location: 'Loading...', date: new Timestamp(1000000, 0), thumbnail: {
      uhd: '/assets/images/yosemite.jpg',
      qhd: '/assets/images/yosemite.jpg',
      hd: '/assets/images/yosemite.jpg',
      fd: '/assets/images/yosemite.jpg',
      sd: '/assets/images/yosemite.jpg'
    }
  }]);

  const strava_color = "var(--ion-color-primary-rgb)";
  const github_color = "var(--ion-color-success-rgb)";
  const [calendar, setCalendar] = useState('computer');
  const [activities, setActivities] = useState<any[]>([]);
  const [commits, setCommits] = useState<any[]>([]);
  const [toast, makeToast] = useState<number>(0);

  useEffect(() => {
        fetch('/data/activities.json').then((response) => {
            response.text().then(result => {
                setActivities(JSON.parse(result));
            });
        });
        fetch('/data/commits.json').then((response) => {
            response.text().then(result => {
                setCommits(JSON.parse(result));
            });
        })
        listGalleries().then((galleries) => {
          setGalleries(galleries);
        });
    }, []);

  const calendarSelector = useRef<null|HTMLIonAccordionGroupElement>(null);
  const closeCalendarSelector = () => {
    if (calendarSelector.current) {
      calendarSelector.current.value = undefined;
    }
  }

  const handleToast = (toast: number) => {
    if (toast == 0) {
      makeToast(1);
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen className={"home-page"+(menu?" menu-open":"")}>
          <div className="home-content">
            <div className="home-header">
              <div className="my-info">
                <IonTitle>Alex D. Hill</IonTitle>
                <p>@alexdhill</p>
              </div>
              <div className="site-info">
                <IonTitle>`in aggregate'</IonTitle>
                <p><CopyrightIcon size={12} />2025</p>
              </div>
            </div>
            <div className="home-body">
              <p>
                Welcome to my portfolio website!
                I had the intention of showcasing some of my non-academic work, but honestly as of now I don't have the time for much else.
                The odds that *most* most of the pages on in the menu get filled out is slim for the time being, but hopefully some of my photos get posted.
              </p>
              <IonTitle>Activity calendar<CalendarDaysIcon size={32} /></IonTitle>
              <IonLabel>
                Below is a GitHub-esque calendar tracking my commit activity (which looks pretty plain since I almost never push to main).
                I also decided to add in my Strava activities to make it look like I actually do things every day.
                This pulls data from Strava's API every night at midnight.
                Instead of commits it shows miles run, biked, hiked, and meters swam on each day, but to keep things fair the color is determined by time instead of distance.
              </IonLabel>
              <div className="activity-container">
                <div className="activity-selector" style={{background: calendar=='computer'?
                    'rgba('+github_color+',0.1)':
                    'rgba('+strava_color+',0.1)'
                }}>
                  <IonLabel className="title">What am I up to</IonLabel>
                  <IonAccordionGroup ref={calendarSelector}>
                    <IonAccordion value="commits">
                      <IonItem slot="header" className="activity-selector-header">
                        <IonLabel>{calendar === 'computer' ? 'on the computer?' : 'on my feet?'}</IonLabel>
                        <ChevronDownIcon size={32} strokeWidth={1.5} className="ion-accordion-toggle-icon" />
                      </IonItem>
                      <div slot="content" className="accordion-content">
                        <IonList lines='none'>
                          <IonItem button onClick={() => {setCalendar('computer'); closeCalendarSelector()}}>
                            <IonLabel>on the computer?</IonLabel>
                          </IonItem>
                          <IonItem button onClick={() => {setCalendar('feet'); closeCalendarSelector()}}>
                            <IonLabel>on my feet?</IonLabel>
                          </IonItem>
                        </IonList>
                      </div>
                    </IonAccordion>
                  </IonAccordionGroup>
                </div>
                <div className="home-calendar">
                  <Calendar
                    activities={calendar=='computer'?commits:activities}
                    color={calendar=='computer'?github_color:strava_color}
                  />
                </div>
              </div>
              <IonTitle className="right"><FullscreenIcon size={32} />Photography</IonTitle>
              <IonLabel>
                I almost never shoot anymore, but when I do it is with a $150 Canon kit I bought on sale at Best Buy in 2015.
                Probably about 10% of my photos are worth looking at, and those will be posted here, grouped together by when and where they were taken.
                I'd estimate that about 75% of these photos are pre-2020, but if things work out I hope to change that.
              </IonLabel>
              <div className="home-image">
                <IonToast
                  isOpen={toast==1} duration={5000}
                  onDidDismiss={() => makeToast(-1)}
                  positionAnchor="gallery-swiper"
                  position="bottom"
                  message="Click to see more"
                  className={menu?"gallery-toast bump":"gallery-toast"}
                >
                </IonToast>
                {galleries.length > 1?
                <Swiper id="gallery-swiper"
                  spaceBetween={0} slidesPerView={1} loop={true}
                  modules={[Pagination, Autoplay]}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3000, pauseOnMouseEnter: true }}
                >
                  {galleries.map((gallery, index) => (
                    <SwiperSlide key={index} onMouseEnter={() => handleToast(toast)}>
                      <img src={gallery.thumbnail.qhd} alt={gallery.title} />
                      <IonTitle>{gallery.title.split(" ").map((word, index) => (
                        <span key={index}>{word}<br/></span>
                      ))}</IonTitle>
                      <Link to={`/photos/${gallery.id}`} className="photo-link" />
                    </SwiperSlide>
                  ))}
                </Swiper>:
                <>
                  <img src={galleries[0]?.thumbnail.uhd} alt={galleries[0]?.title} />
                  <IonTitle>{galleries[0]?.location.split(",")[0].split(" ").map((word, index) => (
                    <span key={index}>{word}<br/></span>
                  ))}</IonTitle>
                </>
                }
              </div>
              <IonTitle>Research<TestTubeDiagonalIcon size={32} /></IonTitle>
              <IonLabel>
                Copied from my resumé: I am a PhD candidate in Bioinformatics at UC Santa Cruz.
                My research explores the use of extracellular RNAs and repetitive elements as predictive markers of early-stage cancer.
                My undergraduate research experience was the development of CRISPR vectors and analysis of ATAC+RNA-seq data in retinal organoids, and the imaging/analysis of rare cell populations and rare cell dynamics in the blood plasma of cancer patients.
                I have experience in cloning, tissue culture, multiple forms of sequencing analysis (ATAC/RNA/DNA on illumina/nanopore), as well as the development of machine learning models for regression and classification.
              </IonLabel>
              <div className="publication-list">
                <Swiper id="publication-swiper"
                  centeredSlides={true}
                  spaceBetween={0}
                  slidesPerView={3}
                  modules={[Navigation]}
                  navigation={true}
                  loop={true}
                >
                  <SwiperSlide onClick={() => window.open('https://www.biorxiv.org/content/10.1101/2025.07.02.662774v1', '_blank')}>
                    <IonLabel className="journ">bioRxiv, 2025</IonLabel>
                    <IonLabel className="title">RNA liquid biopsy via nanopore sequencing for novel biomarker discovery and cancer early detection</IonLabel>
                    <IonLabel className="author"><u>Hill, AD.</u> & Peddu, V. Maroli, SLV. Mattingly, C. Gardener, JMV. Miga KH. Fitzgerald, RC. Kim, DH.</IonLabel>
                  </SwiperSlide>
                  <SwiperSlide onClick={() => window.open('https://www.nature.com/articles/s41551-023-01081-7', '_blank')}>
                    <IonLabel className="journ">Nature BME, 2023</IonLabel>
                    <IonLabel className="title">Profiling of repetitive element RNAs in the blood plasma of patients with cancer</IonLabel>
                    <IonLabel className="author">
                      Reggiardo, RE. Maroli, SLV. Peddu, V. Davidson, AE. <u>Hill, AD.</u> LaMontagne, E. Al Aaraj, Y. Jain, M. Chan, SY. Kim, DH.
                    </IonLabel>
                  </SwiperSlide>
                  <SwiperSlide onClick={() => window.open('https://www.mdpi.com/2073-4409/11/21/3412', '_blank')}>
                    <IonLabel className="journ">Cells, 2022</IonLabel>
                    <IonLabel className="title">Chromatin accessibility and transcriptional differences in human stem cell-derived early-stage retinal organoids</IonLabel>
                    <IonLabel className="author">Jones, MK. Agarwal, D. Mazo, KW. Chopre, M. Jurlina, SL. Dash, N. Xu, Q. Ortega, AR. Chow, M. <u>Hill, AD.</u> Kambli, NK. Xu, G. Sasik, R. Birmingham, A. Fisch, KM. Weinreb, RN. Enke, RA. Skowronska-Krawczyk, D. Wahlin, KJ.</IonLabel>
                  </SwiperSlide>
                  <SwiperSlide onClick={() => window.open('https://www.biorxiv.org/content/10.1101/2025.07.02.662774v1', '_blank')}>
                    <IonLabel className="journ">bioRxiv, 2025</IonLabel>
                    <IonLabel className="title">RNA liquid biopsy via nanopore sequencing for novel biomarker discovery and cancer early detection</IonLabel>
                    <IonLabel className="author"><u>Hill, AD.</u> & Peddu, V. Maroli, SLV. Mattingly, C. Gardener, JMV. Miga KH. Fitzgerald, RC. Kim, DH.</IonLabel>
                  </SwiperSlide>
                  <SwiperSlide onClick={() => window.open('https://www.nature.com/articles/s41551-023-01081-7', '_blank')}>
                    <IonLabel className="journ">Nature BME, 2023</IonLabel>
                    <IonLabel className="title">Profiling of repetitive element RNAs in the blood plasma of patients with cancer</IonLabel>
                    <IonLabel className="author">
                      Reggiardo, RE. Maroli, SLV. Peddu, V. Davidson, AE. <u>Hill, AD.</u> LaMontagne, E. Al Aaraj, Y. Jain, M. Chan, SY. Kim, DH.
                    </IonLabel>
                  </SwiperSlide>
                  <SwiperSlide onClick={() => window.open('https://www.mdpi.com/2073-4409/11/21/3412', '_blank')}>
                    <IonLabel className="journ">Cells, 2022</IonLabel>
                    <IonLabel className="title">Chromatin accessibility and transcriptional differences in human stem cell-derived early-stage retinal organoids</IonLabel>
                    <IonLabel className="author">Jones, MK. Agarwal, D. Mazo, KW. Chopre, M. Jurlina, SL. Dash, N. Xu, Q. Ortega, AR. Chow, M. <u>Hill, AD.</u> Kambli, NK. Xu, G. Sasik, R. Birmingham, A. Fisch, KM. Weinreb, RN. Enke, RA. Skowronska-Krawczyk, D. Wahlin, KJ.</IonLabel>
                  </SwiperSlide>
                </Swiper>
              </div>
              <IonTitle className="right"><CableIcon size={32} />Homelab</IonTitle>
              <IonLabel>
                I've been told that the following is 'not very interesting' but I will stick it up here anyway.
                I have a small homelab setup (which loosely means that I had an old raspberry pi doing nothing)
                that I use for maintaining computer backups, running adblocks, and hosting a media server with the explicit purpose of streaming the 1966 hit TV show <i>Batman</i>.

              </IonLabel>
            </div>
          </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
