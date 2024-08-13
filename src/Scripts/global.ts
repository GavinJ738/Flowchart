interface ElectronAPI {
    saveJson: (jsonData: any) => void;
    onSaveJsonReply: (callback: (status: string) => void) => void;
}

interface Window {
    electronAPI: ElectronAPI;
}