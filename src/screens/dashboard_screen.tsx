import { useState, useEffect } from 'react';
import type { ComponentProps } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import type { RootStackParamList } from '../../App';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenFooter } from '../components/ScreenFooter';
import { auth } from '../services/firebaseConfig';
import { defaultSettings, subscribeClients, subscribeProcesses, subscribeSettings, type ClientRecord, type ProcessRecord } from '../services/officeData';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;
type IconName = ComponentProps<typeof Ionicons>['name'];
type DashboardTabId =
    | 'home'
    | 'clientesProcessos'
    | 'alvarasPrazos'
    | 'sair';

interface DashboardStats {
    totalClientes: number;
    clientesCadastrados: number;
    processos: number;
    alvarasCompletos: number;
    alvarasPendentes: number;
    prazos: {
        id: string;
        nome: string;
        dataVencimento: string;
        dias: number;
    }[];
}

export default function DashboardScreen({ navigation }: Props) {
    const [activeTab, setActiveTab] = useState<DashboardTabId>('home');
    const [clients, setClients] = useState<ClientRecord[]>([]);
    const [processes, setProcesses] = useState<ProcessRecord[]>([]);
    const [settings, setSettings] = useState(defaultSettings);
    const [dataError, setDataError] = useState('');
    const stats: DashboardStats = {
        totalClientes: clients.length,
        clientesCadastrados: new Set(processes.map(item => item.clientId)).size,
        processos: processes.length,
        alvarasCompletos: processes.filter(item => item.status === 'Aprovado').length,
        alvarasPendentes: processes.filter(item => item.status === 'Pendência').length,
        prazos: (settings.notificationsEnabled ? processes : []).filter(item => item.dueDate && item.status !== 'Aprovado').map(item => ({
            id: item.id,
            nome: `${item.kind} - ${item.clientName}`,
            dataVencimento: item.dueDate,
            dias: Math.ceil((new Date(`${item.dueDate}T23:59:59`).getTime() - Date.now()) / 86400000),
        })).filter(item => Number.isFinite(item.dias) && item.dias <= settings.deadlineAlertDays).sort((a, b) => a.dias - b.dias),
    };

    useEffect(() => {
        let stopClients: (() => void) | undefined;
        let stopProcesses: (() => void) | undefined;
        let stopSettings: (() => void) | undefined;
        const stopAuth = onAuthStateChanged(auth, user => {
            stopClients?.();
            stopProcesses?.();
            stopSettings?.();
            stopClients = undefined;
            stopProcesses = undefined;
            stopSettings = undefined;

            if (!user) {
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                return;
            }

            setDataError('');
            try {
                stopClients = subscribeClients(setClients, error => setDataError(error.message));
                stopProcesses = subscribeProcesses(setProcesses, error => setDataError(error.message));
                stopSettings = subscribeSettings(setSettings, error => setDataError(error.message));
            } catch (error) {
                setDataError(error instanceof Error ? error.message : 'Erro ao carregar dados.');
            }
        });
        return () => {
            stopAuth();
            stopClients?.();
            stopProcesses?.();
            stopSettings?.();
        };
    }, [navigation]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } finally {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        }
    };

    const dashboardTabs: {
        id: DashboardTabId;
        label: string;
        icon: IconName;
        value: string;
        description: string;
    }[] = [
        {
            id: 'home',
            label: 'Home',
            icon: 'home-outline',
            value: 'Resumo',
            description: 'Visão geral dos indicadores e atividades recentes.',
        },
        {
            id: 'clientesProcessos',
            label: 'Clientes e Processos',
            icon: 'people-outline',
            value: `${stats.totalClientes} / ${stats.processos}`,
            description: `${stats.clientesCadastrados} clientes com processos e ${stats.processos} processos em acompanhamento.`,
        },
        {
            id: 'alvarasPrazos',
            label: 'Pendências e Prazos',
            icon: 'shield-checkmark-outline',
            value: `${stats.alvarasPendentes} / ${stats.prazos.length}`,
            description: `${stats.alvarasPendentes} processos pendentes e ${stats.prazos.length} prazos próximos.`,
        },
        {
            id: 'sair',
            label: 'Sair',
            icon: 'log-out-outline',
            value: '',
            description: 'Encerrar a sessão atual.',
        },
    ];

    const activeTabData =
        dashboardTabs.find((tab) => tab.id === activeTab) ?? dashboardTabs[0];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader navigation={navigation} title="Dashboard" />

            <ScrollView
                bounces={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.container}
            >
                {dataError ? <Text style={{ color: '#F07171', marginHorizontal: 16, marginTop: 12 }}>{dataError}</Text> : null}
                <View style={styles.activeTabCard}>
                    <View style={styles.activeTabIcon}>
                        <Ionicons
                            color="#FF5A00"
                            name={activeTabData.icon}
                            size={28}
                        />
                    </View>
                    <View style={styles.activeTabInfo}>
                        <Text style={styles.activeTabTitle}>
                            {activeTabData.label}
                        </Text>
                        <Text style={styles.activeTabDescription}>
                            {activeTabData.description}
                        </Text>
                    </View>
                    <Text style={styles.activeTabValue}>
                        {activeTabData.value}
                    </Text>
                </View>

                {/* KPI Cards - Primeira Linha */}
                <View style={styles.kpiGrid}>
                    <KPICard
                        icon="people-outline"
                        title="Clientes Total"
                        value={stats.totalClientes.toString()}
                        color="#FF5A00"
                        bgColor="rgba(255, 90, 0, 0.1)"
                    />
                    <KPICard
                        icon="checkmark-circle-outline"
                        title="Com processos"
                        value={stats.clientesCadastrados.toString()}
                        color="#00DD00"
                        bgColor="rgba(0, 221, 0, 0.1)"
                    />
                </View>

                {/* KPI Cards - Segunda Linha */}
                <View style={styles.kpiGrid}>
                    <KPICard
                        icon="document-outline"
                        title="Processos"
                        value={stats.processos.toString()}
                        color="#FFD700"
                        bgColor="rgba(255, 215, 0, 0.1)"
                    />
                    <KPICard
                        icon="shield-checkmark-outline"
                        title="Aprovados"
                        value={stats.alvarasCompletos.toString()}
                        color="#00DD00"
                        bgColor="rgba(0, 221, 0, 0.1)"
                    />
                </View>

                {/* Alvarás Pendentes Card */}
                <View style={styles.largeCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconBg}>
                            <Ionicons
                                color="#FF0000"
                                name="alert-circle-outline"
                                size={28}
                            />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Processos Pendentes</Text>
                            <Text style={styles.cardSubtitle}>
                                Necessitam acompanhamento
                            </Text>
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.largeNumber}>
                            {stats.alvarasPendentes}
                        </Text>
                        <Text style={styles.statusText}>
                            itens necessitam atenção
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Reports')}>
                        <Text style={styles.actionBtnText}>Ver Detalhes →</Text>
                    </TouchableOpacity>
                </View>

                {/* Prazos Section */}
                <View>
                    <View style={styles.sectionHeader}>
                        <Ionicons
                            color="#FF5A00"
                            name="calendar-outline"
                            size={24}
                        />
                        <Text style={styles.sectionTitle}>
                            Prazos Próximos
                        </Text>
                    </View>

                    {stats.prazos.map((prazo) => (
                        <PrazoCard key={prazo.id} prazo={prazo} />
                    ))}

                    {stats.prazos.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                Nenhum prazo próximo.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Estatísticas */}
                <View style={styles.statsSection}>
                    <View style={styles.sectionHeader}>
                        <Ionicons color="#FF5A00" name="stats-chart-outline" size={24} />
                        <Text style={styles.sectionTitle}>
                            Estatísticas Gerais
                        </Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Taxa de Conclusão</Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${stats.processos ? Math.round(stats.alvarasCompletos / stats.processos * 100) : 0}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.statValue}>{stats.processos ? Math.round(stats.alvarasCompletos / stats.processos * 100) : 0}%</Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>
                            Processos em acompanhamento
                        </Text>
                        <Text style={styles.statValue}>{stats.processos - stats.alvarasCompletos}</Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Atualização</Text>
                        <Text style={styles.statValue}>Em tempo real</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.actionsSection}>
                    <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                    <View style={styles.actionsGrid}>
                        <ActionButton
                            icon="person-add-outline"
                            label="Novo Cliente"
                            onPress={() => navigation.navigate('NewClient')}
                        />
                        <ActionButton
                            icon="document-text-outline"
                            label="Novo Processo"
                            onPress={() => navigation.navigate('NewProcess')}
                        />
                        <ActionButton
                            icon="download-outline"
                            label="Relatório"
                            onPress={() => navigation.navigate('Reports')}
                        />
                        <ActionButton
                            icon="settings-outline"
                            label="Configurações"
                            onPress={() => navigation.navigate('Settings')}
                        />
                    </View>
                </View>

                <ScreenFooter navigation={navigation} />
            </ScrollView>

            <View style={styles.bottomTabsWrapper}>
                <View style={styles.tabsContent}>
                    {dashboardTabs.map((tab) => {
                        const isActive = tab.id === activeTab;

                        return (
                            <TouchableOpacity
                                key={tab.id}
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (tab.id === 'sair') {
                                        void handleLogout();
                                        return;
                                    }

                                    setActiveTab(tab.id);
                                }}
                                style={[
                                    styles.tabButton,
                                    isActive && styles.tabButtonActive,
                                    tab.id === 'sair' && styles.logoutTabButton,
                                ]}
                            >
                                <Ionicons
                                    color={
                                        isActive
                                            ? '#000000'
                                            : tab.id === 'sair'
                                              ? '#FF4D4D'
                                              : '#FF5A00'
                                    }
                                    name={tab.icon}
                                    size={22}
                                />
                                <Text
                                    style={[
                                        styles.tabLabel,
                                        isActive && styles.tabLabelActive,
                                        tab.id === 'sair' && styles.logoutTabLabel,
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
}

interface KPICardProps {
    icon: string;
    title: string;
    value: string;
    color: string;
    bgColor: string;
}

function KPICard({ icon, title, value, color, bgColor }: KPICardProps) {
    return (
        <View style={[styles.kpiCard, { backgroundColor: bgColor }]}>
            <View style={styles.kpiHeader}>
                <Ionicons color={color} name={icon as IconName} size={28} />
            </View>
            <Text style={styles.kpiValue}>{value}</Text>
            <Text style={styles.kpiTitle}>{title}</Text>
        </View>
    );
}

interface PrazoCardProps {
    prazo: {
        id: string;
        nome: string;
        dataVencimento: string;
        dias: number;
    };
}

function PrazoCard({ prazo }: PrazoCardProps) {
    const isUrgent = prazo.dias <= 5;
    const isWarning = prazo.dias <= 10 && prazo.dias > 5;

    return (
        <View
            style={[
                styles.prazoCard,
                isUrgent && styles.prazoCardUrgent,
                isWarning && styles.prazoCardWarning,
            ]}
        >
            <View style={styles.prazoContent}>
                <Text style={styles.prazoName}>{prazo.nome}</Text>
                <Text style={styles.prazoDate}>
                    Vencimento: {prazo.dataVencimento}
                </Text>
            </View>
            <View
                style={[
                    styles.prazoBadge,
                    isUrgent && styles.prazoBadgeUrgent,
                    isWarning && styles.prazoBadgeWarning,
                ]}
            >
                <Text
                    style={[
                        styles.prazoBadgeText,
                        isUrgent && styles.prazoBadgeTextUrgent,
                    ]}
                >
                    {prazo.dias}d
                </Text>
            </View>
        </View>
    );
}

interface ActionButtonProps {
    icon: string;
    label: string;
    onPress: () => void;
}

function ActionButton({ icon, label, onPress }: ActionButtonProps) {
    return (
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
            <View style={styles.actionIcon}>
                <Ionicons color="#FF5A00" name={icon as IconName} size={28} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#161616',
    },
    container: {
        flex: 1,
        backgroundColor: '#161616',
    },
    scrollContent: {
        paddingBottom: 30,
    },

    // Navigation Tabs
    bottomTabsWrapper: {
        paddingTop: 10,
        paddingBottom: 8,
        backgroundColor: '#202020',
        borderTopWidth: 1,
        borderTopColor: '#454545',
    },
    tabsContent: {
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: 8,
    },
    tabButton: {
        flex: 1,
        minWidth: 0,
        height: 58,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#242424',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#454545',
        paddingHorizontal: 2,
    },
    tabButtonActive: {
        backgroundColor: '#FF5A00',
        borderColor: '#FF5A00',
    },
    logoutTabButton: {
        borderColor: '#7a3030',
    },
    tabLabel: {
        marginTop: 6,
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 12,
    },
    tabLabelActive: {
        color: '#000000',
    },
    logoutTabLabel: {
        color: '#FF4D4D',
    },
    activeTabCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 4,
        padding: 14,
        backgroundColor: '#242424',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#454545',
        gap: 12,
    },
    activeTabIcon: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
    },
    activeTabInfo: {
        flex: 1,
    },
    activeTabTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    activeTabDescription: {
        marginTop: 3,
        color: '#b6b6b6',
        fontSize: 12,
        lineHeight: 16,
    },
    activeTabValue: {
        color: '#FF5A00',
        fontSize: 18,
        fontWeight: '700',
    },

    // Loading
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#b6b6b6',
        marginTop: 12,
        fontSize: 14,
    },

    // KPI Grid
    kpiGrid: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        marginTop: 16,
    },
    kpiCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#454545',
        alignItems: 'center',
    },
    kpiHeader: {
        marginBottom: 12,
    },
    kpiValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    kpiTitle: {
        fontSize: 12,
        color: '#b6b6b6',
        textAlign: 'center',
    },

    // Large Card
    largeCard: {
        marginHorizontal: 16,
        marginBottom: 24,
        backgroundColor: '#353535',
        borderRadius: 12,
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#FF0000',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    iconBg: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#b6b6b6',
        marginTop: 2,
    },
    cardContent: {
        alignItems: 'center',
        marginBottom: 16,
    },
    largeNumber: {
        fontSize: 48,
        fontWeight: '700',
        color: '#FF0000',
    },
    statusText: {
        fontSize: 12,
        color: '#b6b6b6',
        marginTop: 8,
    },
    actionBtn: {
        backgroundColor: '#FF5A00',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionBtnText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 14,
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Prazos
    prazoCard: {
        marginHorizontal: 16,
        marginBottom: 10,
        backgroundColor: '#353535',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 3,
        borderLeftColor: '#FFD700',
    },
    prazoCardUrgent: {
        borderLeftColor: '#FF0000',
        backgroundColor: '#3a1a1a',
    },
    prazoCardWarning: {
        borderLeftColor: '#FF9500',
        backgroundColor: '#3a2a1a',
    },
    prazoContent: {
        flex: 1,
    },
    prazoName: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 4,
    },
    prazoDate: {
        color: '#b6b6b6',
        fontSize: 12,
    },
    prazoBadge: {
        backgroundColor: '#1a1a1a',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    prazoBadgeUrgent: {
        borderColor: '#FF0000',
    },
    prazoBadgeWarning: {
        borderColor: '#FF9500',
    },
    prazoBadgeText: {
        color: '#FFD700',
        fontWeight: '700',
        fontSize: 12,
    },
    prazoBadgeTextUrgent: {
        color: '#FF0000',
    },

    // Empty State
    emptyState: {
        marginHorizontal: 16,
        marginVertical: 24,
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        color: '#b6b6b6',
        fontSize: 14,
    },

    // Statistics
    statsSection: {
        marginTop: 24,
    },
    statRow: {
        marginHorizontal: 16,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#454545',
    },
    statLabel: {
        fontSize: 13,
        color: '#b6b6b6',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF5A00',
        marginTop: 4,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#353535',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF5A00',
        borderRadius: 4,
    },

    // Actions
    actionsSection: {
        marginTop: 24,
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionButton: {
        width: '48%',
        backgroundColor: '#353535',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#454545',
    },
    actionIcon: {
        marginBottom: 10,
    },
    actionLabel: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
});
