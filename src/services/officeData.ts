import { onValue, push, ref, set } from 'firebase/database';
import { auth, database } from './firebaseConfig';

export type ClientKind = 'Pessoa física' | 'Pessoa jurídica';
export type ProcessStatus = 'Em preparação' | 'Protocolado' | 'Em análise' | 'Aprovado' | 'Pendência';

export interface ClientRecord {
    id: string;
    kind: ClientKind;
    name: string;
    document: string;
    email: string;
    phone: string;
    contact: string;
    address: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    notes: string;
    createdAt: number;
}

export interface ProcessRecord {
    id: string;
    clientId: string;
    clientName: string;
    title: string;
    protocol: string;
    kind: 'AVCB' | 'CLCB' | 'Regularização' | 'Outro';
    status: ProcessStatus;
    propertyAddress: string;
    municipality: string;
    occupancy: string;
    area: string;
    floors: string;
    responsible: string;
    dueDate: string;
    notes: string;
    createdAt: number;
}

export interface OfficeSettings {
    officeName: string;
    defaultCity: string;
    defaultState: string;
    defaultResponsible: string;
    deadlineAlertDays: number;
    notificationsEnabled: boolean;
    lawsBase: string;
    technicalInstructionsBase: string;
    standardsBase: string;
}

export const defaultSettings: OfficeSettings = {
    officeName: '', defaultCity: '', defaultState: 'SP', defaultResponsible: '',
    deadlineAlertDays: 15, notificationsEnabled: true,
    lawsBase: '', technicalInstructionsBase: '', standardsBase: '',
};

function userPath(segment: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Sessão expirada. Entre novamente para continuar.');
    return `usuarios/${uid}/${segment}`;
}

export async function createClient(data: Omit<ClientRecord, 'id' | 'createdAt'>) {
    const item = push(ref(database, userPath('clients')));
    if (!item.key) throw new Error('Não foi possível gerar o cadastro.');
    await set(item, { ...data, id: item.key, createdAt: Date.now() });
}

export async function createProcess(data: Omit<ProcessRecord, 'id' | 'createdAt'>) {
    const item = push(ref(database, userPath('processes')));
    if (!item.key) throw new Error('Não foi possível gerar o processo.');
    await set(item, { ...data, id: item.key, createdAt: Date.now() });
}

export function subscribeClients(onData: (items: ClientRecord[]) => void, onError: (error: Error) => void) {
    return onValue(ref(database, userPath('clients')), snapshot => {
        const value = snapshot.val() as Record<string, ClientRecord> | null;
        onData(value ? Object.values(value) : []);
    }, onError);
}

export function subscribeProcesses(onData: (items: ProcessRecord[]) => void, onError: (error: Error) => void) {
    return onValue(ref(database, userPath('processes')), snapshot => {
        const value = snapshot.val() as Record<string, ProcessRecord> | null;
        onData(value ? Object.values(value) : []);
    }, onError);
}

export function subscribeSettings(onData: (settings: OfficeSettings) => void, onError: (error: Error) => void) {
    return onValue(ref(database, userPath('settings')), snapshot => {
        onData({ ...defaultSettings, ...(snapshot.val() as Partial<OfficeSettings> | null) });
    }, onError);
}

export async function saveSettings(settings: OfficeSettings) {
    await set(ref(database, userPath('settings')), settings);
}
