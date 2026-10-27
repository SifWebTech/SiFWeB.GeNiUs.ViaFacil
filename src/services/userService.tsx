// Importa a operação que cria uma conta com e-mail e senha.
import {
    createUserWithEmailAndPassword,
} from 'firebase/auth';

// Importa as operações usadas para salvar o perfil no Realtime Database.
import {
    ref,
    set,
} from 'firebase/database';

// Usa as instâncias únicas de autenticação e banco configuradas no projeto.
import {
    auth,
    database,
} from './firebaseConfig';

// O modelo garante que o perfil tenha sempre os campos esperados.
import {
    UserModel,
} from '../model/UserModel';

// Centraliza o cadastro da conta e do perfil do usuário.
class UserService {
    // Primeiro cria a conta no Authentication e depois salva o perfil no banco.
    async cadastrarUsuario(
        nome: string,
        celular: string,
        email: string,
        senha: string
    ): Promise<UserModel> {

        // O Firebase valida o e-mail, a senha e devolve a nova conta.
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                senha
            );
        // Usa o UID da autenticação como chave do perfil no banco.
        const uid =
            userCredential.user.uid;

        // Monta somente os dados públicos; a senha nunca é salva no Database.
        const usuario: UserModel = {
            id: uid,
            nome: nome,
            celular: celular,
            email: email,
            createdAt: new Date().toISOString(),
        };

        // Grava o perfil em usuarios/{uid}.
        await set(
            ref(database, `usuarios/${uid}`),
            usuario
        );

        // Devolve o perfil para a tela saber que o cadastro terminou.
        return usuario;
    }
}

// Exporta uma única instância para todas as telas compartilharem o serviço.
export const userService = new UserService();
