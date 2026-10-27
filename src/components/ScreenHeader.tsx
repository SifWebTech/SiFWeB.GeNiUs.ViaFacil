// Cabeçalho reutilizado nas telas públicas do aplicativo.
import { Ionicons } from '@expo/vector-icons';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';

// Propriedades que cada tela pode enviar ao cabeçalho.
interface ScreenHeaderProps {
    navigation: NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>;
    title: string;
    showBackButton?: boolean;
}

// Exibe o título centralizado e, quando permitido, o botão de retorno.
export function ScreenHeader({
    navigation,
    title,
    showBackButton = true,
}: ScreenHeaderProps) {
    return (
        <View style={styles.header}>
            {showBackButton && (
                /* O botão retorna à tela inicial de apresentação. */
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Splash')}
                    style={styles.backButton}
                >
                    <Ionicons
                        color="#FF5A00"
                        name="arrow-back-outline"
                        size={24}
                    />
                </TouchableOpacity>
            )}

            <Text style={styles.title}>{title}</Text>

            {/* Ocupa o mesmo espaço do botão para manter o título centralizado. */}
            <View style={styles.spacer} />
        </View>
    );
}

// Estilos visuais exclusivos do cabeçalho.
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#161616',
        borderBottomWidth: 1,
        borderBottomColor: '#353535',
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    title: {
        flex: 1,
        color: '#FF5A00',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    spacer: {
        width: 44,
    },
});
