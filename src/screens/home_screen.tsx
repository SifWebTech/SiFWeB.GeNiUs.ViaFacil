import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { PrimaryButton, colors } from '../components/OfficeUI';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    return (
        <SafeAreaView style={styles.page}>
            <View style={styles.content}>
                <Text style={styles.title}>ViaFácil</Text>
                <Text style={styles.subtitle}>Gerencie clientes e processos do seu escritório.</Text>
                <PrimaryButton
                    label="Novo cliente"
                    icon="person-add-outline"
                    onPress={() => navigation.navigate('NewClient')}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, padding: 18, gap: 18, justifyContent: 'center', width: '100%', maxWidth: 760, alignSelf: 'center' },
    title: { color: colors.text, fontSize: 28, fontWeight: '800' },
    subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
});
