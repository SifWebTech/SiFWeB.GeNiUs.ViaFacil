export type TipoCliente = 'Pessoa física' | 'Pessoa jurídica';

export interface ClienteModel {
    id?: string;
    tipoCliente: TipoCliente;
    nomeCliente: string;
    CpfCnpj: string;
    celular: string;
    email: string;
    contato: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    observacoes: string;
    idade?: number | string;
    dataAtividade?: string;
    createdAt?: number;
}
