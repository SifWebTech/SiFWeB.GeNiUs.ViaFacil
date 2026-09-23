import { useEffect, useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Field, OfficePage, PrimaryButton, Section, colors } from '../components/OfficeUI';
import { defaultSettings, saveSettings, subscribeSettings, type OfficeSettings } from '../services/officeData';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
    const [settings, setSettings] = useState<OfficeSettings>(defaultSettings);
    const [alertDaysInput, setAlertDaysInput] = useState(String(defaultSettings.deadlineAlertDays));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const setField = (key: keyof OfficeSettings) => (value: string) => setSettings(current => ({ ...current, [key]: value }));

    useEffect(() => {
        try { return subscribeSettings(value => { setSettings(value); setAlertDaysInput(String(value.deadlineAlertDays)); }, value => setError(value.message)); }
        catch (value) { setError(value instanceof Error ? value.message : 'Erro ao carregar configurações.'); }
    }, []);

    async function save() {
        const days = Number(alertDaysInput);
        if (!alertDaysInput.trim() || !Number.isInteger(days) || days < 0 || days > 365) { Alert.alert('Prazo inválido', 'Informe um número de 0 a 365 dias.'); return; }
        setSaving(true);
        try { await saveSettings({ ...settings, deadlineAlertDays: days, defaultState: settings.defaultState.trim().toUpperCase() }); Alert.alert('Configurações salvas', 'Suas preferências foram atualizadas.'); }
        catch (value) { Alert.alert('Não foi possível salvar', value instanceof Error ? value.message : 'Tente novamente.'); }
        finally { setSaving(false); }
    }

    return <OfficePage navigation={navigation} title="Configurações" subtitle="Preferências da conta, padrões dos cadastros e fontes de consulta.">
        {error ? <Text style={{ color: colors.red }}>{error}</Text> : null}
        <Section title="Aplicativo e escritório"><Field label="Nome do escritório" value={settings.officeName} onChangeText={setField('officeName')} /><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 }}><Text style={{ color: colors.text, flex: 1 }}>Mostrar prazos no dashboard</Text><Switch value={settings.notificationsEnabled} onValueChange={value => setSettings(current => ({ ...current, notificationsEnabled: value }))} trackColor={{ true: colors.orange }} /></View><Field label="Antecedência dos prazos (dias)" value={alertDaysInput} onChangeText={setAlertDaysInput} keyboardType="numeric" /></Section>
        <Section title="Padrões dos cadastros"><Field label="Cidade padrão" value={settings.defaultCity} onChangeText={setField('defaultCity')} /><Field label="UF padrão" value={settings.defaultState} onChangeText={setField('defaultState')} autoCapitalize="characters" /><Field label="Responsável técnico padrão" value={settings.defaultResponsible} onChangeText={setField('defaultResponsible')} /></Section>
        <Section title="Bases de leis e normas"><Text style={{ color: colors.muted, lineHeight: 20 }}>Referências para a futura tela de consulta. Informe links oficiais ou identificadores da base que pretende usar.</Text><Field label="Base de leis e decretos" value={settings.lawsBase} onChangeText={setField('lawsBase')} placeholder="URL ou referência oficial" autoCapitalize="none" /><Field label="Instruções técnicas do Corpo de Bombeiros" value={settings.technicalInstructionsBase} onChangeText={setField('technicalInstructionsBase')} placeholder="URL ou referência oficial" autoCapitalize="none" /><Field label="Normas técnicas" value={settings.standardsBase} onChangeText={setField('standardsBase')} placeholder="URL ou referência oficial" autoCapitalize="none" /><Text style={{ color: colors.muted, fontSize: 12 }}>A consulta e sincronização dessas bases ainda não estão implementadas.</Text></Section>
        <PrimaryButton label={saving ? 'Salvando...' : 'Salvar configurações'} onPress={() => void save()} disabled={saving} icon="save-outline" />
    </OfficePage>;
}
