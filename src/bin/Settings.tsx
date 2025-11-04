import { createContext, Dispatch, SetStateAction, useContext } from "react"

type SettingsType = {
    theme: 'light' | 'dark' | 'warm';
    setTheme?: Dispatch<SetStateAction<any>>;
    menu: boolean;
    setMenu?: Dispatch<SetStateAction<boolean>>;
    progress: boolean | number;
    setProgress?: Dispatch<SetStateAction<boolean | number>>;
}

const Settings = createContext<SettingsType>({theme: 'light', menu: true, progress: false})

export const SettingsProvider = ({ children, value }: { children: React.ReactNode, value: SettingsType }) => {
    return (
        <Settings.Provider value={value}>
            {children}
        </Settings.Provider>
    )
}

export const useSettings = () => {
    const context = useContext(Settings);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

export type { SettingsType };