import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import type { RootStackParamList } from '../../App';
import { userService } from '../services/userService';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenFooter } from '../components/ScreenFooter';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uppercaseRegex = /[A-Z]/;
const symbolRegex = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/;
const firefighterImage = require('../../assets/images/bombeiro_chamas_subindo_laterais.gif');

function maskEmail(value: string) {
    return value.trim().toLowerCase().replace(/\s/g, '');
}

function maskPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) {
        return digits;
    }

    if (digits.length <= 7) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function RegisterScreen({ navigation }: Props) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit() {
        const normalizedEmail = maskEmail(email);
        const phoneDigits = phone.replace(/\D/g, '');
        let hasError = false;

        if (!name.trim()) {
            setNameError('Digite o nome.');
            hasError = true;
        } else {
            setNameError('');
        }

        if (!phoneDigits) {
            setPhoneError('Digite o celular.');
            hasError = true;
        } else if (phoneDigits.length < 10) {
            setPhoneError('Digite um celular válido.');
            hasError = true;
        } else {
            setPhoneError('');
        }

        if (!normalizedEmail) {
            setEmailError('Digite o e-mail.');
            hasError = true;
        } else if (!emailRegex.test(normalizedEmail)) {
            setEmailError('Digite um e-mail válido.');
            hasError = true;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Digite a senha.');
            hasError = true;
        } else if (password.length < 8) {
            setPasswordError('A senha deve ter pelo menos 8 caracteres.');
            hasError = true;
        } else if (!uppercaseRegex.test(password)) {
            setPasswordError('A senha deve ter pelo menos uma letra maiúscula.');
            hasError = true;
        } else if (!symbolRegex.test(password)) {
            setPasswordError('A senha deve ter pelo menos um símbolo.');
            hasError = true;
        } else {
            setPasswordError('');
        }

        if (!confirmPassword) {
            setConfirmPasswordError('Confirme a senha.');
            hasError = true;
        } else if (confirmPassword !== password) {
            setConfirmPasswordError('As senhas não conferem.');
            hasError = true;
        } else {
            setConfirmPasswordError('');
        }

        if (!hasError) {
            const celularSemMascara = phoneDigits;
            await cadastrarUsuario(
                name.trim(),
                celularSemMascara,
                normalizedEmail,
                password
            );
        }
    }

    async function cadastrarUsuario(
        nome: string,
        celularSemMascara: string,
        email: string,
        senha: string
    ) {
        try {
            setCarregando(true);
            await userService.cadastrarUsuario(
                nome,
                celularSemMascara,
                email,
                senha
            );

            Alert.alert(
                'Sucesso!',
                'Cadastro realizado com sucesso. Faça login para continuar.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]
            );

            // Limpar formulário
            setName('');
            setPhone('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            let mensagemErro = 'Erro ao realizar cadastro';

            if (error.code === 'auth/email-already-in-use') {
                mensagemErro = 'Este e-mail já está cadastrado';
            } else if (error.code === 'auth/weak-password') {
                mensagemErro = 'Senha muito fraca';
            } else if (error.code === 'auth/invalid-email') {
                mensagemErro = 'E-mail inválido';
            }

            Alert.alert('Erro', mensagemErro);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader navigation={navigation} title="Cadastro" />

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
                    <Text style={styles.label}>Seu nome</Text>
                    <TextInput
                        autoComplete="off"
                        autoCorrect={false}
                        importantForAutofill="no"
                        textContentType="none"
                        onChangeText={(value) => {
                            setName(value);
                            setNameError('');
                        }}
                        placeholder="Nome"
                        placeholderTextColor="#b6b6b6"
                        style={[styles.input, nameError ? styles.inputError : undefined]}
                        value={name}
                    />
                    {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

                    <Text style={styles.label}>Seu celular</Text>
                    <TextInput
                        autoComplete="off"
                        importantForAutofill="no"
                        textContentType="none"
                        inputMode="tel"
                        keyboardType="phone-pad"
                        onChangeText={(value) => {
                            setPhone(maskPhone(value));
                            setPhoneError('');
                        }}
                        placeholder="(00) 00000-0000"
                        placeholderTextColor="#b6b6b6"
                        style={[styles.input, phoneError ? styles.inputError : undefined]}
                        value={phone}
                    />
                    {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                    <Text style={styles.label}>Seu e-mail</Text>
                    <TextInput
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect={false}
                        importantForAutofill="no"
                        inputMode="email"
                        keyboardType="email-address"
                        onChangeText={(value) => {
                            setEmail(maskEmail(value));
                            setEmailError('');
                        }}
                        placeholder="E-mail"
                        textContentType="none"
                        placeholderTextColor="#b6b6b6"
                        style={[styles.input, emailError ? styles.inputError : undefined]}
                        value={email}
                    />
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                    <Text style={styles.label}>Sua senha</Text>
                    <View
                        style={[
                            styles.passwordBox,
                            passwordError ? styles.inputError : undefined,
                        ]}
                    >
                        <TextInput
                            autoComplete="off"
                            importantForAutofill="no"
                            onChangeText={(value) => {
                                setPassword(value);
                                setPasswordError('');
                            }}
                        
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

                    <Text style={styles.label}>Confirmar senha</Text>
                    <View
                        style={[
                            styles.passwordBox,
                            confirmPasswordError ? styles.inputError : undefined,
                        ]}
                    >
                        <TextInput
                            autoComplete="off"
                            importantForAutofill="no"
                            onChangeText={(value) => {
                                setConfirmPassword(value);
                                setConfirmPasswordError('');
                            }}
                            placeholder="Confirmar senha"
                            placeholderTextColor="#b6b6b6"
                            secureTextEntry={!showConfirmPassword}
                            style={styles.passwordInput}
                            textContentType="oneTimeCode"
                            value={confirmPassword}
                        />
                        <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.showPasswordButton}
                        >
                            <Text style={styles.showPasswordText}>
                                {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {confirmPasswordError ? (
                        <Text style={styles.errorText}>{confirmPasswordError}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.button, carregando && styles.botaoDesabilitado]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        disabled={carregando}
                    >
                        {carregando ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>CADASTRAR</Text>
                        )}
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
        paddingTop: 6,
        paddingBottom: 14,
        paddingHorizontal: 16,
    },
    firefighterImage: {
        width: 100,
        height: 150,
    },
    form: {
        width: '100%',
        maxWidth: 250,
        marginTop: 10,
    },
    label: {
        marginTop: 6,
        marginBottom: 4,
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    input: {
        width: '100%',
        height: 42,
        borderWidth: 2,
        borderColor: '#FF5A00',
        borderRadius: 2,
        paddingHorizontal: 14,
        fontSize: 15,
        color: '#FFFFFF',
        backgroundColor: '#353535',
    },
    inputError: {
        borderColor: '#FF0000',
    },
    passwordBox: {
        width: '100%',
        height: 42,
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
        fontSize: 15,
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
        marginTop: 4,
        color: '#FF0000',
        fontSize: 12,
    },
    button: {
        height: 46,
        marginTop: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        borderWidth: 2,
        borderColor: '#FF5A00',
        backgroundColor: '#353535',
    },
    botaoDesabilitado: {
        opacity: 0.6,
        backgroundColor: '#1a1a1a',
        borderColor: '#b39d73',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});
