import { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Choices, Field, OfficePage, PrimaryButton, Section, colors } from '../components/OfficeUI';
import { createClient, subscribeSettings, type ClientKind, type ClientRecord } from '../services/officeData';

type Props = NativeStackScreenProps<RootStackParamList, 'NewClient'>;
type ClientDraft = Omit<ClientRecord, 'id' | 'createdAt'>;
const blank: ClientDraft = { kind: 'Pessoa jurídica', name: '', document: '', email: '', phone: '', contact: '', address: '', number: '', complement: '', neighborhood: '', city: '', state: '', postalCode: '', notes: '' };

export default function NewClientScreen({ navigation }: Props) {
    const [draft, setDraft] = useState<ClientDraft>(blank);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        try { return subscribeSettings(settings => setDraft(current => ({ ...current, city: current.city || settings.defaultCity, state: current.state || settings.defaultState })), () => {}); }
        catch { return; }
    }, []);
    const setField = (key: keyof ClientDraft) => (value: string) => setDraft(current => ({ ...current, [key]: value }));

    async function save() {
        const document = draft.document.replace(/\D/g, '');
        if (!draft.name.trim() || !draft.city.trim() || !draft.state.trim() || !draft.phone.trim()) {
            Alert.alert('Campos obrigatórios', 'Preencha nome, telefone, cidade e UF.'); return;
        }
        if (document.length !== (draft.kind === 'Pessoa física' ? 11 : 14)) {
            Alert.alert('Documento inválido', `Informe um ${draft.kind === 'Pessoa física' ? 'CPF com 11' : 'CNPJ com 14'} dígitos.`); return;
        }
        if (draft.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
            Alert.alert('E-mail inválido', 'Confira o endereço de e-mail.'); return;
        }
        setSaving(true);
        try {
            await createClient({ ...draft, name: draft.name.trim(), document, email: draft.email.trim(), phone: draft.phone.trim() });
            Alert.alert('Cliente cadastrado', 'O cliente foi salvo com sucesso.', [{ text: 'Voltar ao dashboard', onPress: () => navigation.goBack() }, { text: 'Cadastrar outro', onPress: () => setDraft(blank) }]);
        } catch (error) { Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.'); }
        finally { setSaving(false); }
    }

    return <OfficePage navigation={navigation} title="Novo cliente" subtitle="Dados de identificação, contato e endereço para acompanhamento dos processos.">
        <Section title="Identificação">
            <Choices<ClientKind> label="Tipo de cliente" options={['Pessoa jurídica', 'Pessoa física']} value={draft.kind} onChange={value => setDraft(current => ({ ...current, kind: value, document: '' }))} />
            <Field label={draft.kind === 'Pessoa física' ? 'Nome completo' : 'Razão social'} value={draft.name} onChangeText={setField('name')} required />
            <Field label={draft.kind === 'Pessoa física' ? 'CPF' : 'CNPJ'} value={draft.document} onChangeText={setField('document')} keyboardType="numeric" required />
            <Field label="Responsável / contato" value={draft.contact} onChangeText={setField('contact')} />
        </Section>
        <Section title="Contato">
            <Field label="Telefone" value={draft.phone} onChangeText={setField('phone')} keyboardType="phone-pad" required />
            <Field label="E-mail" value={draft.email} onChangeText={setField('email')} keyboardType="email-address" autoCapitalize="none" />
        </Section>
        <Section title="Endereço">
            <Field label="CEP" value={draft.postalCode} onChangeText={setField('postalCode')} keyboardType="numeric" />
            <Field label="Logradouro" value={draft.address} onChangeText={setField('address')} />
            <Field label="Número" value={draft.number} onChangeText={setField('number')} />
            <Field label="Complemento" value={draft.complement} onChangeText={setField('complement')} />
            <Field label="Bairro" value={draft.neighborhood} onChangeText={setField('neighborhood')} />
            <Field label="Cidade" value={draft.city} onChangeText={setField('city')} required />
            <Field label="UF" value={draft.state} onChangeText={setField('state')} autoCapitalize="characters" required />
        </Section>
        <Section title="Observações"><Field label="Informações adicionais" value={draft.notes} onChangeText={setField('notes')} multiline /></Section>
        <Text style={{ color: colors.muted, fontSize: 12 }}>* Campos obrigatórios</Text>
        <PrimaryButton label={saving ? 'Salvando...' : 'Cadastrar cliente'} onPress={() => void save()} disabled={saving} />
    </OfficePage>;
}
