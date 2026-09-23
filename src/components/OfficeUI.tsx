import type { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

export const colors = { background: '#161616', surface: '#252525', border: '#414141', text: '#FFFFFF', muted: '#B9B9B9', orange: '#FF6A16', green: '#49C990', red: '#F07171' };

export function OfficePage({ navigation, title, subtitle, children }: { navigation: NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>; title: string; subtitle?: string; children: ReactNode }) {
    return <SafeAreaView style={ui.page}>
        <View style={ui.topbar}><TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar" style={ui.back}><Ionicons name="arrow-back" size={23} color={colors.orange} /></TouchableOpacity><Text style={ui.topTitle}>{title}</Text><View style={ui.back} /></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}>
            {subtitle ? <Text style={ui.subtitle}>{subtitle}</Text> : null}{children}
        </ScrollView>
    </SafeAreaView>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
    return <View style={ui.section}><Text style={ui.sectionTitle}>{title}</Text>{children}</View>;
}

export function Field({ label, value, onChangeText, placeholder, keyboardType, multiline, required, autoCapitalize }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'; multiline?: boolean; required?: boolean; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' }) {
    return <View style={ui.field}><Text style={ui.label}>{label}{required ? ' *' : ''}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#858585" keyboardType={keyboardType} autoCapitalize={autoCapitalize} multiline={multiline} style={[ui.input, multiline && ui.multiline]} /></View>;
}

export function Choices<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (value: T) => void }) {
    return <View style={ui.field}><Text style={ui.label}>{label}</Text><View style={ui.choices}>{options.map(option => <TouchableOpacity key={option} onPress={() => onChange(option)} accessibilityRole="button" accessibilityState={{ selected: value === option }} style={[ui.choice, value === option && ui.choiceActive]}><Text style={[ui.choiceText, value === option && ui.choiceTextActive]}>{option}</Text></TouchableOpacity>)}</View></View>;
}

export function PrimaryButton({ label, onPress, disabled, icon = 'checkmark-circle-outline' }: { label: string; onPress: () => void; disabled?: boolean; icon?: React.ComponentProps<typeof Ionicons>['name'] }) {
    return <TouchableOpacity onPress={onPress} disabled={disabled} accessibilityRole="button" style={[ui.button, disabled && ui.buttonDisabled]}><Ionicons name={icon} size={20} color="#151515" /><Text style={ui.buttonText}>{label}</Text></TouchableOpacity>;
}

export const ui = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background }, topbar: { height: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 14 }, back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }, topTitle: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' }, content: { padding: 18, paddingBottom: 42, gap: 18, width: '100%', maxWidth: 760, alignSelf: 'center' }, subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 }, section: { gap: 12 }, sectionTitle: { color: colors.orange, fontSize: 16, fontWeight: '700', marginBottom: 2 }, field: { gap: 6 }, label: { color: colors.muted, fontSize: 13, fontWeight: '600' }, input: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 6, backgroundColor: colors.surface, color: colors.text, paddingHorizontal: 13, fontSize: 15 }, multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, choice: { paddingHorizontal: 12, minHeight: 38, justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, choiceActive: { borderColor: colors.orange, backgroundColor: '#4A2A1B' }, choiceText: { color: colors.muted, fontSize: 13 }, choiceTextActive: { color: colors.text, fontWeight: '700' }, button: { minHeight: 50, borderRadius: 6, backgroundColor: colors.orange, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 16 }, buttonDisabled: { opacity: 0.55 }, buttonText: { color: '#151515', fontWeight: '800', fontSize: 15 },
});
