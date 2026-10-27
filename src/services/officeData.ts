// Este serviço mantém clientes, processos e configurações sincronizados em tempo real.
import { onValue, push, ref, set } from 'firebase/database';
import { auth, database } from './firebaseConfig';

// Tipos aceitos nos registros salvos no Firebase.
export type ClientKind = 'Pessoa física' | 'Pessoa jurídica';
export type ProcessStatus = 'Em preparação' | 'Protocolado' | 'Em análise' | 'Aprovado' | 'Pendência';

// Formato de cliente que as telas de painel, processos e relatórios consomem.
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

// Formato completo de um processo salvo no banco.
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

// Preferências do escritório associadas à conta autenticada.
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

// Valores usados enquanto ainda não existe configuração salva.
export const defaultSettings: OfficeSettings = {
    officeName: '', defaultCity: '', defaultState: 'SP', defaultResponsible: '',
    deadlineAlertDays: 15, notificationsEnabled: true,
    lawsBase: '', technicalInstructionsBase: '', standardsBase: '',
};

// Monta um caminho dentro do usuário atual e impede acesso sem login.
function userPath(segment: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Sessão expirada. Entre novamente para continuar.');
    return `usuarios/${uid}/${segment}`;
}

// Cadastra um cliente no formato compartilhado pelas telas do escritório.
export async function createClient(data: Omit<ClientRecord, 'id' | 'createdAt'>) {
    // push cria uma chave única sem substituir outro cadastro.
    const item = push(ref(database, userPath('clients')));
    if (!item.key) throw new Error('Não foi possível gerar o cadastro.');
    // set grava o objeto completo junto com o ID e o horário de criação.
    await set(item, { ...data, id: item.key, createdAt: Date.now() });
}

// Cadastra um processo dentro da conta atualmente conectada.
export async function createProcess(data: Omit<ProcessRecord, 'id' | 'createdAt'>) {
    const item = push(ref(database, userPath('processes')));
    if (!item.key) throw new Error('Não foi possível gerar o processo.');
    await set(item, { ...data, id: item.key, createdAt: Date.now() });
}

// Escuta clientes em tempo real e avisa a tela sempre que algo mudar.
export function subscribeClients(onData: (items: ClientRecord[]) => void, onError: (error: Error) => void) {
    return onValue(ref(database, userPath('clients')), snapshot => {
        const value = snapshot.val() as Record<string, ClientRecord> | null;
        // O Firebase devolve um objeto por ID; Object.values o transforma em lista.
        onData(value ? Object.values(value) : []);
    }, onError);
}

// Mantém a lista de processos atualizada sem exigir recarregamento manual.
export function subscribeProcesses(onData: (items: ProcessRecord[]) => void, onError: (error: Error) => void) {
    return onValue(ref(database, userPath('processes')), snapshot => {
        const value = snapshot.val() as Record<string, ProcessRecord> | null;
        onData(value ? Object.values(value) : []);
    }, onError);
}

// Lê configurações em tempo real e completa campos ausentes com os padrões.
export function subscribeSettings(onData: (settings: OfficeSettings) => void, onError: (error: Error) => void) {
    return onValue(ref(database, userPath('settings')), snapshot => {
        onData({ ...defaultSettings, ...(snapshot.val() as Partial<OfficeSettings> | null) });
    }, onError);
}

// Substitui as configurações antigas pelo conjunto informado pela tela.
export async function saveSettings(settings: OfficeSettings) {
    await set(ref(database, userPath('settings')), settings);
}
