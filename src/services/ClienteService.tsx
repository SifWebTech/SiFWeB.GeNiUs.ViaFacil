import { child, get, push, ref, remove, update } from 'firebase/database';
import { ClienteModel } from '../model/ClienteModel';
import { auth, database } from './firebaseConfig';

// Tipo para mapear os erros de validação de cada campo do formulário
export type ErrosCliente = Partial<Record<keyof ClienteModel, string>>;

// Formato salvo no Firebase (mesmas chaves lidas por dashboard, processos e relatórios)
type ClienteRegistro = {
    id: string;
    kind: ClienteModel['tipoCliente'];
    name: string;
    document: string;
    email: string;
    phone: string;
    contact: string;
    address: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    notes: string;
    createdAt: number;
    idade?: number | string;
    dataAtividade?: string;
};

// Clientes ficam dentro do usuário logado: usuarios/{uid}/clients
function caminhoClientes(id?: string): string {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Sessão expirada. Entre novamente para continuar.');
    return `usuarios/${uid}/clients${id ? `/${id}` : ''}`;
}

// App (ClienteModel) -> Firebase (JSON). O Firebase não aceita valores undefined.
function paraRegistro(dados: Partial<ClienteModel>): Partial<ClienteRegistro> {
    const mapa: Record<string, unknown> = {
        id: dados.id,
        kind: dados.tipoCliente,
        name: dados.nomeCliente,
        document: dados.CpfCnpj,
        email: dados.email,
        phone: dados.celular,
        contact: dados.contato,
        address: dados.logradouro,
        number: dados.numero,
        complement: dados.complemento,
        neighborhood: dados.bairro,
        city: dados.cidade,
        state: dados.uf,
        postalCode: dados.cep,
        notes: dados.observacoes,
        createdAt: dados.createdAt,
        idade: dados.idade,
        dataAtividade: dados.dataAtividade,
    };
    Object.keys(mapa).forEach((chave) => mapa[chave] === undefined && delete mapa[chave]);
    return mapa as Partial<ClienteRegistro>;
}

// Firebase (JSON) -> App (ClienteModel)
function paraModelo(id: string, r: Partial<ClienteRegistro>): ClienteModel {
    return {
        id,
        tipoCliente: r.kind ?? 'Pessoa jurídica',
        nomeCliente: r.name ?? '',
        CpfCnpj: r.document ?? '',
        celular: r.phone ?? '',
        email: r.email ?? '',
        contato: r.contact ?? '',
        cep: r.postalCode ?? '',
        logradouro: r.address ?? '',
        numero: r.number ?? '',
        complemento: r.complement ?? '',
        bairro: r.neighborhood ?? '',
        cidade: r.city ?? '',
        uf: r.state ?? '',
        observacoes: r.notes ?? '',
        idade: r.idade,
        dataAtividade: r.dataAtividade,
        createdAt: r.createdAt,
    };
}

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

    static aplicarMascaraCep(texto: string): string {
        const limpo = texto.replace(/\D/g, '').substring(0, 8);
        return limpo.length <= 5 ? limpo : `${limpo.substring(0, 5)}-${limpo.substring(5)}`;
    }

    static validarCampos(dados: ClienteModel): { valido: boolean; erros: ErrosCliente } {
        const erros: ErrosCliente = {};

        if (!dados.nomeCliente || !dados.nomeCliente.trim()) {
            erros.nomeCliente = 'Campo obrigatório.';
        }

        const pessoaFisica = dados.tipoCliente === 'Pessoa física';
        const cpfCnpj = (dados.CpfCnpj || '').replace(/\D/g, '');
        if (!cpfCnpj) {
            erros.CpfCnpj = 'Campo obrigatório.';
        } else if (cpfCnpj.length !== (pessoaFisica ? 11 : 14)) {
            erros.CpfCnpj = pessoaFisica ? 'Informe um CPF com 11 dígitos.' : 'Informe um CNPJ com 14 dígitos.';
        }

        const celular = (dados.celular || '').replace(/\D/g, '');
        if (!celular) {
            erros.celular = 'Campo obrigatório.';
        } else if (celular.length < 10) {
            erros.celular = 'Telefone inválido.';
        }

        // e-mail é opcional, mas se informado precisa ser válido
        if (dados.email && dados.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
            erros.email = 'E-mail inválido.';
        }

        if (!dados.cidade || !dados.cidade.trim()) {
            erros.cidade = 'Campo obrigatório.';
        }

        if (!dados.uf || !dados.uf.trim()) {
            erros.uf = 'Campo obrigatório.';
        }

        // data é opcional, mas se informada precisa estar completa
        if (dados.dataAtividade && dados.dataAtividade.length !== 10) {
            erros.dataAtividade = 'Data inválida (dd/mm/aaaa).';
        }

        return {
            valido: Object.keys(erros).length === 0,
            erros,
        };
    }

    static async criar(dados: ClienteModel): Promise<ClienteModel> {
        try {
            // Gera uma chave/ID única no nó "clients" do usuário
            const novoClienteRef = push(ref(database, caminhoClientes()));
            const novoId = novoClienteRef.key;

            if (!novoId) {
                throw new Error('Não foi possível gerar um ID único no Firebase.');
            }

            const novoCliente: ClienteModel = {
                ...dados,
                id: novoId,
                createdAt: Date.now(),
            };

            // Guarda os dados na referência criada
            await update(novoClienteRef, paraRegistro(novoCliente));

            return novoCliente;
        } catch (error) {
            console.error('Erro ao criar cliente no Firebase:', error);
            throw new Error('Falha ao registrar o cliente no banco de dados.');
        }
    }

    static async listarTodos(): Promise<ClienteModel[]> {
        try {
            const snapshot = await get(child(ref(database), caminhoClientes()));

            if (snapshot.exists()) {
                const data = snapshot.val();

                // Transforma o objeto (JSON) retornado do Firebase num array de ClienteModel
                return Object.keys(data).map((key) => paraModelo(key, data[key]));
            }

            return [];
        } catch (error) {
            console.error('Erro ao listar clientes do Firebase:', error);
            throw new Error('Falha ao carregar os clientes.');
        }
    }

    static async obterPorId(id: string): Promise<ClienteModel | null> {
        try {
            const snapshot = await get(child(ref(database), caminhoClientes(id)));

            return snapshot.exists() ? paraModelo(id, snapshot.val()) : null;
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
            await update(ref(database, caminhoClientes(id)), paraRegistro({ ...dados, id }));
            return true;
        } catch (error) {
            console.error(`Erro ao atualizar cliente com ID ${id}:`, error);
            throw new Error('Falha ao atualizar o cliente.');
        }
    }

    static async excluir(id: string): Promise<boolean> {
        try {
            await remove(ref(database, caminhoClientes(id)));
            return true;
        } catch (error) {
            console.error(`Erro ao excluir cliente com ID ${id}:`, error);
            throw new Error('Falha ao remover o cliente.');
        }
    }
}
