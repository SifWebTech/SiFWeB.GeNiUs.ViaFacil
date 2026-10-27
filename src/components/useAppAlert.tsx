// Fornece a mesma experiência de alerta no celular e no navegador.
import { useCallback, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AlertButton } from 'react-native';

// Guarda o conteúdo que será exibido quando o modal web estiver aberto.
type Dialog = { title: string; message: string; buttons: AlertButton[] };

// Alert.alert não tem implementação na web. O modal mantém mensagens e ações visíveis.
export function useAppAlert() {
    // null significa que nenhum alerta está visível.
    const [dialog, setDialog] = useState<Dialog | null>(null);
    // No celular usa o alerta nativo; na web salva os dados para abrir o modal.
    const showAlert = useCallback((title: string, message = '', buttons: AlertButton[] = [{ text: 'OK' }]) => {
        if (Platform.OS !== 'web') {
            Alert.alert(title, message, buttons);
            return;
        }
        setDialog({ title, message, buttons: buttons.length ? buttons : [{ text: 'OK' }] });
    }, []);

    // Cria o modal somente quando existe uma mensagem pendente.
    const alertDialog = dialog ? <Modal visible transparent animationType="fade" onRequestClose={() => setDialog(null)}>
        <View style={styles.backdrop}>
            <View style={styles.dialog} accessibilityViewIsModal>
                <Text accessibilityRole="header" style={styles.title}>{dialog.title}</Text>
                <ScrollView style={styles.messageScroll}><Text style={styles.message}>{dialog.message}</Text></ScrollView>
                <View style={styles.actions}>
                    {/* Cada botão fecha o modal e executa sua ação opcional. */}
                    {dialog.buttons.map((button, index) => <TouchableOpacity
                        key={index}
                        accessibilityRole="button"
                        onPress={() => { setDialog(null); button.onPress?.(); }}
                        style={styles.button}
                    ><Text style={[styles.buttonText, button.style === 'destructive' && styles.destructive]}>{button.text || 'OK'}</Text></TouchableOpacity>)}
                </View>
            </View>
        </View>
    </Modal> : null;

    // A tela chama showAlert e inclui alertDialog dentro do seu JSX.
    return { showAlert, alertDialog };
}

// Aparência do fundo escuro, da caixa de mensagem e dos botões.
const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', alignItems: 'center', justifyContent: 'center', padding: 20 },
    dialog: { width: '100%', maxWidth: 420, maxHeight: '90%', backgroundColor: '#252525', borderColor: '#FF6A16', borderWidth: 1, borderRadius: 8, padding: 20, gap: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    messageScroll: { flexGrow: 0, flexShrink: 1 },
    message: { color: '#FFFFFF', fontSize: 15, lineHeight: 22 },
    actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10 },
    button: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1, borderColor: '#414141', borderRadius: 6 },
    buttonText: { color: '#FF6A16', fontWeight: '700' },
    destructive: { color: '#F07171' },
});
