import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Choices, Field, OfficePage, PrimaryButton, Section, colors } from '../components/OfficeUI';
import { createProcess, subscribeClients, subscribeSettings, type ClientRecord, type ProcessRecord } from '../services/officeData';

type Props = NativeStackScreenProps<RootStackParamList, 'NewProcess'>;
type Draft = Omit<ProcessRecord, 'id' | 'createdAt'>;
const blank: Draft = { clientId: '', clientName: '', title: '', protocol: '', kind: 'AVCB', status: 'Em preparação', propertyAddress: '', municipality: '', occupancy: '', area: '', floors: '', responsible: '', dueDate: '', notes: '' };

export default function NewProcessScreen({ navigation }: Props) {
    const [draft, setDraft] = useState<Draft>(blank);
    const [clients, setClients] = useState<ClientRecord[]>([]);
    const [saving, setSaving] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [dataError, setDataError] = useState('');
    const setField = (key: keyof Draft) => (value: string) => setDraft(current => ({ ...current, [key]: value }));

    useEffect(() => {
        try {
            const unsubscribeClients = subscribeClients(setClients, error => setDataError(error.message));
            const unsubscribeSettings = subscribeSettings(settings => setDraft(current => ({ ...current, responsible: current.responsible || settings.defaultResponsible, municipality: current.municipality || settings.defaultCity })), error => setDataError(error.message));
            return () => { unsubscribeClients(); unsubscribeSettings(); };
        } catch (error) { setDataError(error instanceof Error ? error.message : 'Erro ao carregar cadastros.'); }
    }, []);

    async function save() {
        if (!draft.clientId || !draft.title.trim() || !draft.propertyAddress.trim() || !draft.municipality.trim()) {
            Alert.alert('Campos obrigatórios', 'Selecione um cliente e preencha identificação, endereço e município do imóvel.'); return;
        }
        if (draft.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(draft.dueDate)) {
            Alert.alert('Data inválida', 'Use o formato AAAA-MM-DD para o prazo.'); return;
        }
        setSaving(true);
        try {
            await createProcess({ ...draft, title: draft.title.trim(), propertyAddress: draft.propertyAddress.trim(), municipality: draft.municipality.trim() });
            Alert.alert('Processo cadastrado', 'O processo foi salvo com sucesso.', [{ text: 'Voltar ao dashboard', onPress: () => navigation.goBack() }, { text: 'Cadastrar outro', onPress: () => setDraft(blank) }]);
        } catch (error) { Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.'); }
        finally { setSaving(false); }
    }

    const visibleClients = clients.filter(client => client.name.toLocaleLowerCase().includes(clientSearch.toLocaleLowerCase())).slice(0, 8);
    return <OfficePage navigation={navigation} title="Novo processo" subtitle="Vincule o cliente e registre os dados do imóvel, protocolo e acompanhamento.">
        <Section title="Cliente">
            <Field label="Buscar cliente" value={clientSearch} onChangeText={setClientSearch} placeholder="Nome ou razão social" />
            {dataError ? <Text style={{ color: colors.red }}>{dataError}</Text> : null}
            {!clients.length ? <View><Text style={{ color: colors.muted }}>Nenhum cliente cadastrado.</Text><TouchableOpacity onPress={() => navigation.navigate('NewClient')}><Text style={{ color: colors.orange, marginTop: 8 }}>Cadastrar cliente</Text></TouchableOpacity></View> : null}
            {visibleClients.map(client => <TouchableOpacity key={client.id} onPress={() => setDraft(current => ({ ...current, clientId: client.id, clientName: client.name }))} style={{ backgroundColor: draft.clientId === client.id ? '#4A2A1B' : colors.surface, borderColor: draft.clientId === client.id ? colors.orange : colors.border, borderWidth: 1, borderRadius: 6, padding: 12 }}><Text style={{ color: colors.text, fontWeight: '700' }}>{client.name}</Text><Text style={{ color: colors.muted, fontSize: 12 }}>{client.document}</Text></TouchableOpacity>)}
        </Section>
        <Section title="Identificação"><Field label="Título do processo" value={draft.title} onChangeText={setField('title')} required /><Field label="Número do protocolo" value={draft.protocol} onChangeText={setField('protocol')} /><Choices label="Tipo de solicitação" options={['AVCB', 'CLCB', 'Regularização', 'Outro'] as const} value={draft.kind} onChange={setField('kind')} /><Choices label="Situação" options={['Em preparação', 'Protocolado', 'Em análise', 'Aprovado', 'Pendência'] as const} value={draft.status} onChange={setField('status')} /></Section>
        <Section title="Imóvel"><Field label="Endereço do imóvel" value={draft.propertyAddress} onChangeText={setField('propertyAddress')} required /><Field label="Município" value={draft.municipality} onChangeText={setField('municipality')} required /><Field label="Ocupação / atividade" value={draft.occupancy} onChangeText={setField('occupancy')} /><Field label="Área construída (m²)" value={draft.area} onChangeText={setField('area')} keyboardType="numeric" /><Field label="Pavimentos" value={draft.floors} onChangeText={setField('floors')} keyboardType="numeric" /></Section>
        <Section title="Acompanhamento"><Field label="Responsável técnico" value={draft.responsible} onChangeText={setField('responsible')} /><Field label="Prazo (AAAA-MM-DD)" value={draft.dueDate} onChangeText={setField('dueDate')} placeholder="2026-12-31" /><Field label="Observações e pendências" value={draft.notes} onChangeText={setField('notes')} multiline /></Section>
        <PrimaryButton label={saving ? 'Salvando...' : 'Cadastrar processo'} onPress={() => void save()} disabled={saving || !clients.length} />
    </OfficePage>;
}
