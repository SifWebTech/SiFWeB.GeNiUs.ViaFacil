import { child, get, push, ref, remove, update } from 'firebase/database';
import { ClienteModel } from '../model/ClienteModel';
import { database } from './firebaseConfig';

// Tipo para mapear os erros de validação de cada campo do formulário
export type ErrosCliente = Partial<Record<keyof ClienteModel, string>>;

export class ClienteService {

    static aplicarMascaraData(texto: string): string {
        let limpo = texto.replace(/\D/g, '');
        if (limpo.length > 8) limpo = limpo.substring(0, 8);
        if (limpo.length <= 2) return limpo;
        if (limpo.length <= 4) return `${limpo.substring(0, 2)}/${limpo.substring(2)}`;
        return `${limpo.substring(0, 2)}/${limpo.substring(2, 4)}/${limpo.substring(4)}`;
    }

    static aplicarMascaraCelular(texto: string): string {
        let limpo = texto.replace(/\D/g, '');
        if (limpo.length > 11) limpo = limpo.substring(0, 11);
        if (limpo.length <= 2) return limpo;
        if (limpo.length <= 6) return `(${limpo.substring(0, 2)}) ${limpo.substring(2)}`;
        if (limpo.length <= 10) return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 6)}-${limpo.substring(6)}`;
        return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 7)}-${limpo.substring(7)}`;
    }

    // CPF (11 dígitos) ou CNPJ (14 dígitos)
    static aplicarMascaraCpfCnpj(texto: string): string {
        let limpo = texto.replace(/\D/g, '');
        if (limpo.length > 14) limpo = limpo.substring(0, 14);

        if (limpo.length <= 11) {
            return limpo
                .replace(/^(\d{3})(\d)/, '$1.$2')
                .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1-$2');
        }

        return limpo
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }

    static validarCampos(dados: ClienteModel): { valido: boolean; erros: ErrosCliente } {
        const erros: ErrosCliente = {};

        if (!dados.nomeCliente || !dados.nomeCliente.trim()) {
            erros.nomeCliente = 'Campo obrigatório.';
        }

        if (!dados.idade || !String(dados.idade).trim()) {
            erros.idade = 'Campo obrigatório.';
        }

        const cpfCnpj = (dados.CpfCnpj || '').replace(/\D/g, '');
        if (!cpfCnpj) {
            erros.CpfCnpj = 'Campo obrigatório.';
        } else if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
            erros.CpfCnpj = 'Informe um CPF (11) ou CNPJ (14) válido.';
        }

        const celular = (dados.celular || '').replace(/\D/g, '');
        if (!celular) {
            erros.celular = 'Campo obrigatório.';
        } else if (celular.length < 10) {
            erros.celular = 'Celular inválido.';
        }

        if (!dados.email || !dados.email.trim()) {
            erros.email = 'Campo obrigatório.';
        } else if (!/^\S+@\S+\.\S+$/.test(dados.email.trim())) {
            erros.email = 'E-mail inválido.';
        }

        if (!dados.dataAtividade || !dados.dataAtividade.trim()) {
            erros.dataAtividade = 'Campo obrigatório.';
        } else if (dados.dataAtividade.length !== 10) {
            erros.dataAtividade = 'Data inválida (dd/mm/aaaa).';
        }

        return {
            valido: Object.keys(erros).length === 0,
            erros,
        };
    }

    static async criar(dados: ClienteModel): Promise<ClienteModel> {
        try {
            const clientesRef = ref(database, 'clientes');

            // Gera uma chave/ID única no nó "clientes"
            const novoClienteRef = push(clientesRef);
            const novoId = novoClienteRef.key;

            if (!novoId) {
                throw new Error('Não foi possível gerar um ID único no Firebase.');
            }

            const novoCliente: ClienteModel = {
                ...dados,
                id: novoId,
            };

            // Guarda os dados na referência criada
            await update(novoClienteRef, novoCliente);

            return novoCliente;
        } catch (error) {
            console.error('Erro ao criar cliente no Firebase:', error);
            throw new Error('Falha ao registrar o cliente no banco de dados.');
        }
    }

    static async listarTodos(): Promise<ClienteModel[]> {
        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, 'clientes'));

            if (snapshot.exists()) {
                const data = snapshot.val();

                // Transforma o objeto (JSON) retornado do Firebase num array de ClienteModel
                return Object.keys(data).map((key) => ({
                    ...data[key],
                    id: key,
                }));
            }

            return [];
        } catch (error) {
            console.error('Erro ao listar clientes do Firebase:', error);
            throw new Error('Falha ao carregar os clientes.');
        }
    }

    static async obterPorId(id: string): Promise<ClienteModel | null> {
        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, `clientes/${id}`));

            if (snapshot.exists()) {
                return {
                    ...snapshot.val(),
                    id,
                };
            }

            return null;
        } catch (error) {
            console.error(`Erro ao buscar cliente com ID ${id}:`, error);
            throw new Error('Falha ao obter os dados do cliente.');
        }
    }

    static async atualizar(
        id: string,
        dados: Partial<Omit<ClienteModel, 'id'>>
    ): Promise<boolean> {
        try {
            const clienteRef = ref(database, `clientes/${id}`);

            await update(clienteRef, { ...dados, id });
            return true;
        } catch (error) {
            console.error(`Erro ao atualizar cliente com ID ${id}:`, error);
            throw new Error('Falha ao atualizar o cliente.');
        }
    }

    static async excluir(id: string): Promise<boolean> {
        try {
            const clienteRef = ref(database, `clientes/${id}`);
            await remove(clienteRef);
            return true;
        } catch (error) {
            console.error(`Erro ao excluir cliente com ID ${id}:`, error);
            throw new Error('Falha ao remover o cliente.');
        }
    }
}
