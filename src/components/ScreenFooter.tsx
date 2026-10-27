// Rodapé compartilhado que oferece atalhos conforme o estado da sessão.
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { auth } from '../services/firebaseConfig';

// O rodapé precisa da navegação para abrir as telas indicadas pelos botões.
interface ScreenFooterProps {
    navigation: NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>;
}

export function ScreenFooter({ navigation }: ScreenFooterProps) {
    // Controla se o atalho do Dashboard deve aparecer.
    const [signedIn, setSignedIn] = useState(false);

    // Observa login e logout; o retorno do Firebase cancela a escuta ao desmontar.
    useEffect(() => onAuthStateChanged(auth, user => setSignedIn(Boolean(user))), []);

    return (
        <View style={styles.footer}>
            <Text style={styles.footerTitle}>SiFWeB.GeNiUs.ViaFacil</Text>
            <Text style={styles.footerText}>Acesso seguro ao sistema</Text>

            {/* Atalhos públicos disponíveis para qualquer visitante. */}
            <View style={styles.actions}>
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate('Login')}
                    style={styles.actionButton}
                >
                    <Ionicons color="#FF5A00" name="log-in-outline" size={16} />
                    <Text style={styles.actionText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate('Register')}
                    style={styles.actionButton}
                >
                    <Ionicons
                        color="#FF5A00"
                        name="person-add-outline"
                        size={16}
                    />
                    <Text style={styles.actionText}>Cadastro</Text>
                </TouchableOpacity>

                {/* O Dashboard aparece somente quando existe uma sessão ativa. */}
                {signedIn && <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate('Dashboard')}
                    style={styles.actionButton}
                >
                    <Ionicons color="#FF5A00" name="grid-outline" size={16} />
                    <Text style={styles.actionText}>Dashboard</Text>
                </TouchableOpacity>}
            </View>
        </View>
    );
}

// Estilos do rodapé e dos seus botões de navegação.
const styles = StyleSheet.create({
    footer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: 32,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#353535',
    },
    footerTitle: {
        color: '#FF5A00',
        fontFamily: 'monospace',
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '700',
    },
    footerText: {
        marginTop: 4,
        color: '#b6b6b6',
        fontSize: 12,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        rowGap: 10,
        columnGap: 12,
        marginTop: 12,
        paddingHorizontal: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 90, 0, 0.3)',
        backgroundColor: 'rgba(255, 90, 0, 0.05)',
    },
    actionText: {
        color: '#FF5A00',
        fontSize: 12,
        fontWeight: '600',
    },
});
