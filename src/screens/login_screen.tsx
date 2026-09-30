import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';

import type { RootStackParamList } from '../../App';
import { auth } from '../services/firebaseConfig';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenFooter } from '../components/ScreenFooter';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const firefighterImage = require('../../assets/images/bombeiro_chamas_subindo_laterais.gif');

function maskEmail(value: string) {
    return value.trim().toLowerCase().replace(/\s/g, '');
}

// No login só conferimos se a senha foi preenchida; as regras de força ficam no cadastro
function validarSenha(senha: string): string {
    if (!senha) {
        return 'Digite sua senha.';
    }

    return '';
}

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [authError, setAuthError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleEmailChange(value: string) {
        const maskedEmail = maskEmail(value);
        setEmail(maskedEmail);

        if (emailError) {
            setEmailError('');
        }
    }

    function handlePasswordChange(value: string) {
        setPassword(value);

        if (passwordError) {
            setPasswordError('');
        }
    }

    async function handleLogin() {
        const normalizedEmail = maskEmail(email);
        let valido = true;

        // Limpar erros anteriores
        setEmailError('');
        setPasswordError('');
        setAuthError('');

        // Validar e-mail
        if (!normalizedEmail) {
            setEmailError('Informe seu e-mail.');
            valido = false;
        } else if (!emailRegex.test(normalizedEmail)) {
            setEmailError('Informe um e-mail válido.');
            valido = false;
        }

        // Validar senha
        const senhaError = validarSenha(password);
        if (senhaError) {
            setPasswordError(senhaError);
            valido = false;
        }

        // Se houver erro, interromper
        if (!valido) {
            return;
        }

        // Tentar login no Firebase
        setLoading(true);
        try {
            await signInWithEmailAndPassword(
                auth,
                normalizedEmail.trim(),
                password
            );

            // Login bem-sucedido - reset navegação
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error: any) {
            console.log('Erro no login:', error.code, error.message);
            let mensagemErro = 'Não foi possível realizar o login. Tente novamente.';

            // Tratamento de erros do Firebase
            if (error.code === 'auth/invalid-credential') {
                mensagemErro = 'E-mail ou senha incorretos.';
            } else if (error.code === 'auth/user-not-found') {
                mensagemErro = 'E-mail ou senha incorretos.';
            } else if (error.code === 'auth/wrong-password') {
                mensagemErro = 'E-mail ou senha incorretos.';
            } else if (error.code === 'auth/too-many-requests') {
                mensagemErro = 'Muitas tentativas incorretas. Tente novamente mais tarde.';
            } else if (error.code === 'auth/network-request-failed') {
                mensagemErro = 'Falha de conexão com a internet.';
            }

            setAuthError(mensagemErro);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader navigation={navigation} title="Login" />

            <ScrollView
                bounces={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                style={styles.container}
            >
                <Image
                    resizeMode="cover"
                    source={firefighterImage}
                    style={styles.firefighterImage}
                />

                <View style={styles.form}>
                    <Text style={styles.label}>Seu e-mail</Text>
                    <TextInput
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect={false}
                        importantForAutofill="no"
                        inputMode="email"
                        keyboardType="email-address"
                        onChangeText={handleEmailChange}
                        placeholder="E-mail"
                        textContentType="none"
                        placeholderTextColor="#b6b6b6"
                        style={[
                            styles.input,
                            emailError ? styles.inputError : undefined,
                        ]}
                        value={email}
                    />
                    {emailError ? (
                        <Text style={styles.errorText}>{emailError}</Text>
                    ) : null}

                    <Text style={styles.passwordLabel}>Sua senha</Text>
                    <View
                        style={[
                            styles.passwordBox,
                            passwordError ? styles.inputError : undefined,
                        ]}
                    >
                        <TextInput
                            autoComplete="off"
                            importantForAutofill="no"
                            onChangeText={handlePasswordChange}
                            placeholder="Senha"
                            placeholderTextColor="#b6b6b6"
                            secureTextEntry={!showPassword}
                            style={styles.passwordInput}
                            textContentType="oneTimeCode"
                            value={password}
                        />
                        <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.showPasswordButton}
                        >
                            <Text style={styles.showPasswordText}>
                                {showPassword ? 'Ocultar' : 'Mostrar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {passwordError ? (
                        <Text style={styles.errorText}>{passwordError}</Text>
                    ) : null}

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleLogin}
                        style={[styles.button, loading && styles.buttonDisabled]}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FF5A00" size="small" />
                        ) : (
                            <Text style={styles.buttonText}>ENTRAR</Text>
                        )}
                    </TouchableOpacity>

                    {authError ? (
                        <Text style={styles.authErrorText}>{authError}</Text>
                    ) : null}
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
    form: {
        width: '100%',
        maxWidth: 250,
        marginTop: 28,
    },
    label: {
        marginBottom: 8,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    passwordLabel: {
        marginTop: 20,
        marginBottom: 8,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    input: {
        width: '100%',
        height: 55,
        borderWidth: 2,
        borderColor: '#FF5A00',
        borderRadius: 2,
        paddingHorizontal: 14,
        fontSize: 16,
        color: '#FFFFFF',
        backgroundColor: '#353535',
    },
    inputError: {
        borderColor: '#FF0000',
    },
    passwordBox: {
        width: '100%',
        height: 55,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FF5A00',
        borderRadius: 2,
        backgroundColor: '#353535',
        overflow: 'hidden',
    },
    passwordInput: {
        flex: 1,
        minWidth: 0,
        height: '100%',
        paddingLeft: 14,
        paddingRight: 4,
        fontSize: 16,
        color: '#FFFFFF',
    },
    showPasswordButton: {
        height: '100%',
        width: 62,
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 1,
        borderLeftColor: '#FF5A00',
    },
    showPasswordText: {
        color: '#FF5A00',
        fontSize: 11,
        fontWeight: '700',
    },
    errorText: {
        marginTop: 6,
        marginBottom: 12,
        color: '#FF0000',
        fontSize: 13,
    },
    button: {
        height: 55,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        borderWidth: 2,
        borderColor: '#FF5A00',
        backgroundColor: '#353535',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    authErrorText: {
        marginTop: 12,
        color: '#FF0000',
        fontSize: 13,
        textAlign: 'center',
    },
});
