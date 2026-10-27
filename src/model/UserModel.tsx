// Define o formato dos dados públicos de uma conta salvos no Firebase.
export interface UserModel {
    // Identificador único criado pelo Firebase Authentication.
    id: string;
    // Dados usados para identificar e contatar o usuário.
    nome: string;
    celular: string;
    email: string;
    // Data de criação em texto ISO; é opcional para aceitar registros antigos.
    createdAt?: string;
}
