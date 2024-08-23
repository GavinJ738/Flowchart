interface ElectronAPI {
    saveJson: (jsonData: any) => void;
    onSaveJsonReply: (callback: (status: string) => void) => void;
    loadJson: () => void;
    onLoadJsonReply: (callback: (data: any) => void) => void;
}

interface Window {
    electronAPI: ElectronAPI;
}