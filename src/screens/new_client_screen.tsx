// Formulário usado tanto para cadastrar quanto para editar um cliente.
import { useAppAlert } from '../components/useAppAlert';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Choices, Field, OfficePage, PrimaryButton, Section, colors } from '../components/OfficeUI';
import { subscribeSettings } from '../services/officeData';
import { ClienteService } from '../services/ClienteService';
import type { ClienteModel, TipoCliente } from '../model/ClienteModel';

type Props = NativeStackScreenProps<RootStackParamList, 'NewClient'>;
// Remove campos criados pelo banco para formar o estado editável do formulário.
type ClientDraft = Omit<ClienteModel, 'id' | 'createdAt' | 'idade' | 'dataAtividade'>;
// Valores usados ao abrir um cadastro novo ou limpar o formulário.
const blank: ClientDraft = { tipoCliente: 'Pessoa jurídica', nomeCliente: '', CpfCnpj: '', email: '', celular: '', contato: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '', observacoes: '' };

export default function NewClientScreen({ navigation, route }: Props) {
    const { showAlert, alertDialog } = useAppAlert();
    // Com clienteId a tela funciona como edição
    const clienteId = route.params?.clienteId;
    const [draft, setDraft] = useState<ClientDraft>(blank);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!!clienteId);
    const [loadFailed, setLoadFailed] = useState(false);
    // Em novo cadastro, preenche cidade e UF com os padrões das configurações.
    useEffect(() => {
        if (clienteId) return;
        try { return subscribeSettings(settings => setDraft(current => ({ ...current, cidade: current.cidade || settings.defaultCity, uf: current.uf || settings.defaultState })), () => {}); }
        catch { return; }
    }, [clienteId]);
    // Em edição, carrega o cliente indicado pelo parâmetro da rota.
    useEffect(() => {
        if (!clienteId) return;
        ClienteService.obterPorId(clienteId)
            .then(cliente => {
                if (!cliente) { setLoadFailed(true); showAlert('Cliente não encontrado', 'Ele pode ter sido excluído.', [{ text: 'Voltar', onPress: () => navigation.goBack() }]); return; }
                const { id, createdAt, idade, dataAtividade, ...dados } = cliente;
                setDraft(dados);
            })
            .catch(error => { setLoadFailed(true); showAlert('Não foi possível carregar', error instanceof Error ? error.message : 'Tente novamente.', [{ text: 'Voltar', onPress: () => navigation.goBack() }]); })
            .finally(() => setLoading(false));
    }, [clienteId, navigation, showAlert]);
    // Cria funções de atualização para qualquer campo e aplica máscara quando enviada.
    const setField = (key: keyof ClientDraft, mask?: (value: string) => string) => (value: string) => setDraft(current => ({ ...current, [key]: mask ? mask(value) : value }));
    // Pessoa física aceita no máximo 11 dígitos; pessoa jurídica aceita até 14.
    const maskDocument = (value: string) => ClienteService.aplicarMascaraCpfCnpj(draft.tipoCliente === 'Pessoa física' ? value.replace(/\D/g, '').slice(0, 11) : value);

    // Valida os dados e escolhe entre criar um registro ou atualizar o existente.
    async function save() {
        const dados: ClientDraft = { ...draft, nomeCliente: draft.nomeCliente.trim(), email: draft.email.trim(), celular: draft.celular.trim(), cidade: draft.cidade.trim(), uf: draft.uf.trim() };
        const { valido, erros } = ClienteService.validarCampos(dados);
        if (!valido) {
            showAlert('Confira os dados', Object.values(erros).join('\n')); return;
        }
        setSaving(true);
        try {
            // A presença de clienteId identifica o modo de edição.
            if (clienteId) {
                await ClienteService.atualizar(clienteId, dados);
                showAlert('Cliente atualizado', 'As alterações foram salvas.', [{ text: 'Voltar', onPress: () => navigation.goBack() }]);
                return;
            }
            await ClienteService.criar(dados);
            showAlert('Cliente cadastrado', 'O cliente foi salvo com sucesso.', [{ text: 'Voltar ao dashboard', onPress: () => navigation.goBack() }, { text: 'Cadastrar outro', onPress: () => setDraft(blank) }]);
        } catch (error) { showAlert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.'); }
        finally { setSaving(false); }
    }

    // O texto dos campos e do botão muda automaticamente no modo de edição.
    return <OfficePage navigation={navigation} title={clienteId ? 'Editar cliente' : 'Novo cliente'} subtitle="Dados de identificação, contato e endereço para acompanhamento dos processos.">
        {loading ? <Text style={{ color: colors.muted }}>Carregando cliente...</Text> : null}
        <Section title="Identificação">
            <Choices<TipoCliente> label="Tipo de cliente" options={['Pessoa jurídica', 'Pessoa física']} value={draft.tipoCliente} onChange={value => setDraft(current => ({ ...current, tipoCliente: value, CpfCnpj: '' }))} />
            <Field label={draft.tipoCliente === 'Pessoa física' ? 'Nome completo' : 'Razão social'} value={draft.nomeCliente} onChangeText={setField('nomeCliente')} required />
            <Field label={draft.tipoCliente === 'Pessoa física' ? 'CPF' : 'CNPJ'} value={draft.CpfCnpj} onChangeText={setField('CpfCnpj', maskDocument)} keyboardType="numeric" required />
            <Field label="Responsável / contato" value={draft.contato} onChangeText={setField('contato')} />
        </Section>
        <Section title="Contato">
            <Field label="Telefone" value={draft.celular} onChangeText={setField('celular', ClienteService.aplicarMascaraCelular)} keyboardType="phone-pad" required />
            <Field label="E-mail" value={draft.email} onChangeText={setField('email')} keyboardType="email-address" autoCapitalize="none" />
        </Section>
        <Section title="Endereço">
            <Field label="CEP" value={draft.cep} onChangeText={setField('cep', ClienteService.aplicarMascaraCep)} keyboardType="numeric" />
            <Field label="Logradouro" value={draft.logradouro} onChangeText={setField('logradouro')} />
            <Field label="Número" value={draft.numero} onChangeText={setField('numero')} />
            <Field label="Complemento" value={draft.complemento} onChangeText={setField('complemento')} />
            <Field label="Bairro" value={draft.bairro} onChangeText={setField('bairro')} />
            <Field label="Cidade" value={draft.cidade} onChangeText={setField('cidade')} required />
            <Field label="UF" value={draft.uf} onChangeText={setField('uf')} autoCapitalize="characters" required />
        </Section>
        <Section title="Observações"><Field label="Informações adicionais" value={draft.observacoes} onChangeText={setField('observacoes')} multiline /></Section>
        <Text style={{ color: colors.muted, fontSize: 12 }}>* Campos obrigatórios</Text>
        <PrimaryButton label={saving ? 'Salvando...' : clienteId ? 'Salvar alterações' : 'Cadastrar cliente'}
        onPress={() => void save()} disabled={saving || loading || loadFailed} />
        {alertDialog}
    </OfficePage>;
}
    // Controla os dados digitados e impede ações durante carregamento ou gravação.
