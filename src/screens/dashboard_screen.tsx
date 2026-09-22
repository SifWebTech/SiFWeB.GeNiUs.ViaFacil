import { useState, useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';

import type { RootStackParamList } from '../../App';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenFooter } from '../components/ScreenFooter';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

interface DashboardStats {
    totalClientes: number;
    clientesCadastrados: number;
    processos: number;
    alvarasCompletos: number;
    alvarasPendentes: number;
    prazos: Array<{
        id: string;
        nome: string;
        dataVencimento: string;
        dias: number;
    }>;
}

export default function DashboardScreen({ navigation }: Props) {
    const [stats, setStats] = useState<DashboardStats>({
        totalClientes: 156,
        clientesCadastrados: 142,
        processos: 38,
        alvarasCompletos: 28,
        alvarasPendentes: 10,
        prazos: [
            {
                id: '1',
                nome: 'Alvará - Empresa ABC',
                dataVencimento: '2024-10-15',
                dias: 5,
            },
            {
                id: '2',
                nome: 'Regularização - Empresa XYZ',
                dataVencimento: '2024-10-20',
                dias: 10,
            },
            {
                id: '3',
                nome: 'Análise - Empresa 123',
                dataVencimento: '2024-10-25',
                dias: 15,
            },
        ],
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Simular carregamento de dados do Firebase
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // TODO: Conectar com Firebase para buscar dados reais
            // const clientes = await getClientesFromFirebase();
            // Aqui os dados vêm mockados por enquanto
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        navigation.navigate('Splash');
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF5A00" />
                    <Text style={styles.loadingText}>Carregando dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader navigation={navigation} title="Dashboard" />

            <ScrollView
                bounces={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.container}
            >
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
                        title="Cadastrados"
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
                        title="Alvarás OK"
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
                            <Text style={styles.cardTitle}>Alvarás Pendentes</Text>
                            <Text style={styles.cardSubtitle}>
                                Aguardando aprovação
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
                    <TouchableOpacity style={styles.actionBtn}>
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
                                Nenhum prazo próximo! 🎉
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
                                    { width: '78%' },
                                ]}
                            />
                        </View>
                        <Text style={styles.statValue}>78%</Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>
                            Tempo Médio (Processos)
                        </Text>
                        <Text style={styles.statValue}>4.2 dias</Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Última Atualização</Text>
                        <Text style={styles.statValue}>Hoje</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.actionsSection}>
                    <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                    <View style={styles.actionsGrid}>
                        <ActionButton
                            icon="person-add-outline"
                            label="Novo Cliente"
                        />
                        <ActionButton
                            icon="document-text-outline"
                            label="Novo Processo"
                        />
                        <ActionButton
                            icon="download-outline"
                            label="Relatório"
                        />
                        <ActionButton
                            icon="settings-outline"
                            label="Configurações"
                        />
                    </View>
                </View>

                <ScreenFooter navigation={navigation} />
            </ScrollView>
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
                <Ionicons color={color} name={icon as any} size={28} />
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
}

function ActionButton({ icon, label }: ActionButtonProps) {
    return (
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={styles.actionIcon}>
                <Ionicons color="#FF5A00" name={icon as any} size={28} />
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
