import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    Image,
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

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const firefighterImage = require('../../assets/images/bombeiro_chamas_subindo_laterais.gif');

export default function MainScreen({ navigation }: Props) {
    function handleAnalisarEmpresa() {
        // TODO: Implementar tela de análise de empresa
        console.log('Análise de empresa em desenvolvimento');
    }

    function handleConsultaITs() {
        // TODO: Implementar tela de consulta de ITs
        console.log('Consulta de ITs em desenvolvimento');
    }

    function handleSolicitacaoAprovacao() {
        // TODO: Implementar tela de solicitação para aprovação
        console.log('Solicitação para aprovação em desenvolvimento');
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader navigation={navigation} title="Menu Principal" />

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

                <Text style={styles.title}>SiFWeB.GeNiUs.ViaFacil</Text>

                <Text style={styles.description}>
                    Gestão Inteligente para Empresas{'\n'}
                    em Regularização e Solicitação de AVCB / CLCB{'\n'}
                    ao Corpo de Bombeiros do Estado de São Paulo.
                </Text>

                <View style={styles.actions}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleAnalisarEmpresa}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>CONSULTE SUA EMPRESA</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleConsultaITs}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Instruções Técnicas ITs/Normas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleSolicitacaoAprovacao}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>SOLICITAR ANÁLISE</Text>
                    </TouchableOpacity>
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
    },
    title: {
        marginTop: 28,
        color: '#FF5A00',
        fontFamily: 'monospace',
        fontSize: 23,
        fontWeight: '400',
        textAlign: 'center',
    },
    description: {
        width: '100%',
        maxWidth: 280,
        marginTop: 27,
        color: '#FF0000',
        fontSize: 18,
        lineHeight: 24,
        textAlign: 'center',
    },
    actions: {
        width: '100%',
        alignItems: 'center',
        marginTop: 14,
        gap: 20,
    },
    button: {
        width: '100%',
        maxWidth: 250,
        height: 55,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#353535',
        borderColor: '#FF5A00',
        borderRadius: 2,
        borderWidth: 2,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
    },
});
