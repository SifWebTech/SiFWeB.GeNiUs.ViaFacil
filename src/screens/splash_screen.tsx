import { useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { auth } from '../services/firebaseConfig';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenFooter } from '../components/ScreenFooter';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const firefighterImage = require('../../assets/images/bombeiro_chamas_subindo_laterais.gif');

const SPLASH_DURATION_MS = 5000;

export default function SplashScreen({ navigation }: Props) {
    useEffect(() => {
        let cancelado = false;

        const timer = setTimeout(async () => {
            // Espera o Firebase recuperar a sessão salva antes de decidir a próxima tela
            await auth.authStateReady();
            if (cancelado) return;

            navigation.reset({
                index: 0,
                routes: [{ name: auth.currentUser ? 'Home' : 'Main' }],
            });
        }, SPLASH_DURATION_MS);

        return () => {
            cancelado = true;
            clearTimeout(timer);
        };
    }, [navigation]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader navigation={navigation} title="AVCB e CLCB Simples e Fácil" />

            <ScrollView
                bounces={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.container}
            >
                <Image
                    resizeMode="cover"
                    source={firefighterImage}
                    style={styles.firefighterImage}
                />

                <Text style={styles.appTitle}>SiFWeB.GeNiUs.ViaFacil</Text>

                <Text style={styles.subtitle}>Análise e Gestão Inteligente</Text>

                <Text style={styles.description}>
                Gestão Inteligente para Empresas{'\n'}
                    em Regularização e Solicitação de {'\n'}
                    AVCB / CLCB{'\n'}
                    ao Corpo de Bombeiros do {'\n'}
                    Estado de São Paulo.
                </Text>

                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Recursos Disponíveis:</Text>
                    <Text style={styles.infoItem}>✓ Autenticação segura com Firebase</Text>
                    <Text style={styles.infoItem}>✓ Dashboard com KPIs em tempo real</Text>
                    <Text style={styles.infoItem}>✓ Acompanhamento de alvarás</Text>
                    <Text style={styles.infoItem}>✓ Controle de prazos</Text>
                </View>

                <ScreenFooter navigation={navigation} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#161616',
    },
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#161616',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 24,
        paddingHorizontal: 16,
    },
    firefighterImage: {
        width: 134,
        height: 200,
        marginBottom: 24,
    },
    appTitle: {
        color: '#FF5A00',
        fontFamily: 'monospace',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        color: '#b6b6b6',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        maxWidth: 280,
    },
    infoSection: {
        width: '100%',
        maxWidth: 280,
        backgroundColor: '#353535',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#FF5A00',
    },
    infoTitle: {
        color: '#FF5A00',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
    },
    infoItem: {
        color: '#b6b6b6',
        fontSize: 13,
        marginBottom: 6,
        lineHeight: 18,
    },
});
