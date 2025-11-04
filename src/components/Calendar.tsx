import { useMemo, useRef } from "react";
import { IonTitle, useIonPopover, PopoverOptions } from "@ionic/react";

import { BikeIcon, DumbbellIcon, FootprintsIcon, GitCommitVerticalIcon, MountainSnowIcon, WavesIcon } from "lucide-react";

import "./Calendar.css";

interface PopoverData {
    activity: any;
}
const Popover: React.FC<PopoverData> = ({activity}) => {
    const select_icon = (type: string) => {
        if (type.includes("bike")) return <BikeIcon size={20} strokeWidth={1.5} />;
        else if (type.includes("run")) return <FootprintsIcon size={20} strokeWidth={1.5} />;
        else if (type.includes("swim")) return <WavesIcon size={20} strokeWidth={1.5} />;
        else if (type.includes("hike")) return <MountainSnowIcon size={20} strokeWidth={1.5} />;
        else return <DumbbellIcon size={20} strokeWidth={1.5} />;
    }

    return(
        <div className="popover-content">
            <IonTitle className="date_header">{activity.date?activity.date:''}</IonTitle>
            {
                (activity.run || activity.bike || activity.swim || activity.hike)?
                    ['run', 'hike', 'bike', 'swim'].map((type) => {
                        if (activity[type]! > 0) return(
                            <div className="act_type" key={type+"_dist"}>
                                {select_icon(type)}
                                <p>{activity[type]?activity[type].toFixed(2):''}mi</p>
                            </div>
                        )
                        else return null;
                    }):
                    <div className="act_type">
                        <GitCommitVerticalIcon size={20} strokeWidth={1.5} />
                        <p>{activity.count} commits</p>
                    </div>
            }
        </div>
    );
};

interface CalendarProps {
    activities: any[];
    color: string;
}

const Calendar: React.FC<CalendarProps> = ({ activities, color }) => {
    const activityRef = useRef<any>({
        date: '',
        count: 0,
        level: 0,
    });
    
    const [present, dismiss] = useIonPopover(Popover, {
        onDidDismiss: () => dismiss(),
        activity: activityRef.current
    });

    const poptions = {
        side: 'bottom', alignment: 'center',
        reference: 'trigger', size: 'auto',
        arrow: true, showBackdrop: false,
        mode: 'ios', translucent: true,
        cssClass: 'hover-popover', animated: true
    } as PopoverOptions;
    
    const handleMouseEnter = (day: any) => {
        if (day.level <= 0) return;
        activityRef.current = day;
        present({
            ...poptions,
            trigger: day.date,
        });
    };
    const handleMouseLeave = (day: any) => {
        if (day.level <= 0) return;
        activityRef.current = {date: "", count: 0, level: -1, run: 0, swim: 0, bike: 0};
        dismiss();
    }

    const days = Array.from({length: 365}, (_,i) => {
        const date = new Date(new Date().getFullYear(), 0, i + 1);
        return {
            date: date.toISOString().split('T')[0],
            count: 0,
            level: 0
        };
    })

    activities.forEach((day) => {
        const index = days.findIndex(d => d.date === day.date);
        if (index !== -1) days[index] = {...day};
    })

    const calendar = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => {
            const month = days.filter((day) => {
                return (day.date.split('-')[1] as unknown as number == i + 1);
            });
            const first = new Date(month[0].date).getDay();
            const data = Array(first).fill({date: "", count: 0, level: -1}).concat(month);
            let weeks = [];
            for (let i = 0; i < data.length; i += 7) {
                weeks.push(data.slice(i, i + 7));
            }
            return weeks;
        });
        return months;
    }, [activities]);

    return (
        <div className="activity-calendar">
            <div className="calendar-body">
                {calendar.map((month, mIndex) => (
                    <div key={mIndex} className="calendar-month">
                        {month.map((week, wIndex) => (
                            <div key={wIndex} className="calendar-week">
                                {week.map((day, dIndex) => (
                                    <div
                                        id={day.date} key={dIndex}
                                        className={"calendar-day"+(day.level>-1?(" "+day.date):" invisible")}
                                        style={{backgroundColor: day.level>-1?("rgba("+color+", "+(((day.level)/5)+0.05)+")"):"transparent"}}
                                        onMouseEnter={() => handleMouseEnter(day)} onMouseLeave={() => handleMouseLeave(day)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;