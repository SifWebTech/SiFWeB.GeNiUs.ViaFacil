import { useAppAlert } from '../components/useAppAlert';
import { useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Field, OfficePage, PrimaryButton, colors } from '../components/OfficeUI';
import { ClienteService } from '../services/ClienteService';
import type { ClienteModel } from '../model/ClienteModel';

type Props = NativeStackScreenProps<RootStackParamList, 'Clients'>;

export default function ClientsScreen({ navigation }: Props) {
    const { showAlert, alertDialog } = useAppAlert();
    const [clientes, setClientes] = useState<ClienteModel[]>([]);
    const [busca, setBusca] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    async function carregar() {
        setErro('');
        try {
            const lista = await ClienteService.listarTodos();
            setClientes(lista.sort((a, b) => a.nomeCliente.localeCompare(b.nomeCliente, 'pt-BR')));
        } catch (error) { setErro(error instanceof Error ? error.message : 'Falha ao carregar os clientes.'); }
        finally { setCarregando(false); }
    }

    // Recarrega sempre que a tela volta a ficar visível (ex.: depois de editar um cliente)
    useFocusEffect(useCallback(() => { void carregar(); }, []));

    const filtrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        const digitos = termo.replace(/\D/g, '');
        if (!termo) return clientes;
        return clientes.filter(cliente =>
            cliente.nomeCliente.toLowerCase().includes(termo)
            || cliente.cidade.toLowerCase().includes(termo)
            || (digitos !== '' && cliente.CpfCnpj.replace(/\D/g, '').includes(digitos)));
    }, [clientes, busca]);

    function excluir(cliente: ClienteModel) {
        showAlert('Excluir cliente', `Deseja excluir "${cliente.nomeCliente}"? Essa ação não pode ser desfeita.`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: async () => {
            try {
                await ClienteService.excluir(cliente.id!);
                setClientes(atual => atual.filter(item => item.id !== cliente.id));
            } catch (error) { showAlert('Não foi possível excluir', error instanceof Error ? error.message : 'Tente novamente.'); }
        } }]);
    }

    return <OfficePage navigation={navigation} title="Clientes" subtitle="Consulte, edite ou exclua os clientes cadastrados na sua conta.">
        <PrimaryButton label="Novo cliente" icon="person-add-outline" onPress={() => navigation.navigate('NewClient')} />
        <Field label="Buscar" value={busca} onChangeText={setBusca} placeholder="Nome, CPF/CNPJ ou cidade" autoCapitalize="none" />
        {erro ? <Text style={{ color: colors.red }}>{erro}</Text> : null}
        {carregando ? <Text style={{ color: colors.muted }}>Carregando clientes...</Text> : null}
        {!carregando && !erro && filtrados.length === 0
            ? <Text style={{ color: colors.muted }}>{clientes.length === 0 ? 'Nenhum cliente cadastrado ainda.' : 'Nenhum cliente encontrado para a busca.'}</Text>
            : null}
        {!carregando && clientes.length > 0 ? <Text style={{ color: colors.muted, fontSize: 12 }}>{filtrados.length} de {clientes.length} cliente(s)</Text> : null}
        {filtrados.map(cliente => <View key={cliente.id} style={{ backgroundColor: colors.surface, borderRadius: 6, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 4 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{cliente.nomeCliente}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{cliente.tipoCliente} · {cliente.CpfCnpj || 'Sem documento'}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{[cliente.celular, cliente.email].filter(Boolean).join(' · ')}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{[cliente.cidade, cliente.uf].filter(Boolean).join(' / ')}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <TouchableOpacity onPress={() => navigation.navigate('NewClient', { clienteId: cliente.id })} accessibilityRole="button" accessibilityLabel={`Editar ${cliente.nomeCliente}`} style={{ flex: 1, minHeight: 40, borderRadius: 6, borderWidth: 1, borderColor: colors.orange, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Ionicons name="create-outline" size={18} color={colors.orange} /><Text style={{ color: colors.orange, fontWeight: '700' }}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => excluir(cliente)} accessibilityRole="button" accessibilityLabel={`Excluir ${cliente.nomeCliente}`} style={{ flex: 1, minHeight: 40, borderRadius: 6, borderWidth: 1, borderColor: colors.red, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Ionicons name="trash-outline" size={18} color={colors.red} /><Text style={{ color: colors.red, fontWeight: '700' }}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>)}
        {alertDialog}
    </OfficePage>;
}
