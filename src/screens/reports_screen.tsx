import { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Choices, OfficePage, Section, colors } from '../components/OfficeUI';
import { subscribeClients, subscribeProcesses, type ClientRecord, type ProcessRecord } from '../services/officeData';

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;
type Period = '30 dias' | '90 dias' | '12 meses' | 'Tudo';
type Group = 'Situação' | 'Tipo';
const statusColors: Record<string, string> = { 'Em preparação': '#8AB4F8', Protocolado: '#E5B45A', 'Em análise': '#B396E5', Aprovado: colors.green, Pendência: colors.red };
const typeColors: Record<string, string> = { AVCB: colors.orange, CLCB: '#66B6DA', Regularização: '#B396E5', Outro: '#A6B37D' };

export default function ReportsScreen({ navigation }: Props) {
    const [clients, setClients] = useState<ClientRecord[]>([]);
    const [processes, setProcesses] = useState<ProcessRecord[]>([]);
    const [period, setPeriod] = useState<Period>('Tudo');
    const [group, setGroup] = useState<Group>('Situação');
    const [selected, setSelected] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const unsubscribeClients = subscribeClients(items => { setClients(items); setLoaded(true); }, value => setError(value.message));
            const unsubscribeProcesses = subscribeProcesses(items => { setProcesses(items); setLoaded(true); }, value => setError(value.message));
            return () => { unsubscribeClients(); unsubscribeProcesses(); };
        } catch (value) { setError(value instanceof Error ? value.message : 'Erro ao carregar relatório.'); }
    }, []);

    const filtered = useMemo(() => {
        const days = period === '30 dias' ? 30 : period === '90 dias' ? 90 : period === '12 meses' ? 365 : Infinity;
        const cutoff = Date.now() - days * 86400000;
        return processes.filter(item => item.createdAt >= cutoff);
    }, [processes, period]);
    const rows = useMemo(() => {
        const keys = group === 'Situação' ? ['Em preparação', 'Protocolado', 'Em análise', 'Aprovado', 'Pendência'] : ['AVCB', 'CLCB', 'Regularização', 'Outro'];
        return keys.map(key => ({ key, count: filtered.filter(item => (group === 'Situação' ? item.status : item.kind) === key).length }));
    }, [filtered, group]);
    const max = Math.max(1, ...rows.map(row => row.count));
    const months = useMemo(() => Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - (5 - index));
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return { key, label: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), count: filtered.filter(item => new Date(item.createdAt).getFullYear() === date.getFullYear() && new Date(item.createdAt).getMonth() === date.getMonth()).length };
    }), [filtered]);
    const monthMax = Math.max(1, ...months.map(item => item.count));
    const selectedItems = filtered.filter(item => {
        const date = new Date(item.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return (!selected || (group === 'Situação' ? item.status : item.kind) === selected) && (!selectedMonth || monthKey === selectedMonth);
    });
    const approved = filtered.filter(item => item.status === 'Aprovado').length;

    return <OfficePage navigation={navigation} title="Relatórios" subtitle="Indicadores atualizados com os cadastros da sua conta. Toque em uma barra para detalhar os processos.">
        <Choices<Period> label="Período de cadastro" options={['30 dias', '90 dias', '12 meses', 'Tudo']} value={period} onChange={value => { setPeriod(value); setSelected(null); }} />
        {error ? <Text style={{ color: colors.red }}>{error}</Text> : null}
        {!loaded && !error ? <Text style={{ color: colors.muted }}>Carregando dados...</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[{ label: 'Clientes', value: clients.length, color: colors.orange }, { label: 'Processos', value: filtered.length, color: '#66B6DA' }, { label: 'Aprovados', value: approved, color: colors.green }, { label: 'Conclusão', value: `${filtered.length ? Math.round(approved / filtered.length * 100) : 0}%`, color: '#E5B45A' }].map(kpi => <View key={kpi.label} style={{ flexBasis: '47%', flexGrow: 1, minHeight: 85, backgroundColor: colors.surface, borderRadius: 6, borderWidth: 1, borderColor: colors.border, padding: 13 }}><Text style={{ color: colors.muted, fontSize: 12 }}>{kpi.label}</Text><Text style={{ color: kpi.color, fontSize: 27, fontWeight: '800' }}>{kpi.value}</Text></View>)}
        </View>
        <Section title="Distribuição de processos">
            <Choices<Group> label="Agrupar por" options={['Situação', 'Tipo']} value={group} onChange={value => { setGroup(value); setSelected(null); }} />
            <View style={{ gap: 16, backgroundColor: colors.surface, padding: 16, borderRadius: 6, borderWidth: 1, borderColor: colors.border }}>
                {rows.map(row => <TouchableOpacity key={row.key} onPress={() => setSelected(selected === row.key ? null : row.key)} accessibilityRole="button" accessibilityLabel={`${row.key}: ${row.count} processos`} style={{ opacity: selected && selected !== row.key ? 0.48 : 1, gap: 7 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.text, fontSize: 13 }}>{row.key}</Text><Text style={{ color: colors.text, fontWeight: '700' }}>{row.count}</Text></View><View style={{ height: 17, backgroundColor: '#383838', borderRadius: 3, overflow: 'hidden' }}><View style={{ height: 17, width: `${row.count / max * 100}%`, backgroundColor: (group === 'Situação' ? statusColors : typeColors)[row.key] }} /></View></TouchableOpacity>)}
            </View>
        </Section>
        <Section title="Atividade mensal">
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', height: 170, backgroundColor: colors.surface, borderRadius: 6, borderWidth: 1, borderColor: colors.border, padding: 14 }}>
                {months.map(month => <TouchableOpacity key={month.key} onPress={() => setSelectedMonth(selectedMonth === month.key ? null : month.key)} accessibilityRole="button" accessibilityLabel={`${month.label}: ${month.count} processos`} style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 5, opacity: selectedMonth && selectedMonth !== month.key ? 0.45 : 1 }}><Text style={{ color: colors.text, fontSize: 11, fontWeight: '700' }}>{month.count}</Text><View style={{ width: '100%', height: Math.max(3, month.count / monthMax * 102), backgroundColor: selectedMonth === month.key ? colors.green : colors.orange, borderRadius: 3 }} /><Text style={{ color: colors.muted, fontSize: 11 }}>{month.label}</Text></TouchableOpacity>)}
            </View>
        </Section>
        <Section title={selected || selectedMonth ? 'Processos filtrados' : 'Processos recentes'}>
            {selectedItems.length === 0 ? <Text style={{ color: colors.muted }}>Nenhum processo para este filtro.</Text> : selectedItems.slice().sort((a, b) => b.createdAt - a.createdAt).map(item => <View key={item.id} style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 10, gap: 3 }}><Text style={{ color: colors.text, fontWeight: '700' }}>{item.title}</Text><Text style={{ color: colors.muted, fontSize: 12 }}>{item.clientName} · {item.kind} · {item.status}</Text><Text style={{ color: colors.muted, fontSize: 12 }}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text></View>)}
        </Section>
    </OfficePage>;
}
