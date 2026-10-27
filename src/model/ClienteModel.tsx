// Limita o tipo de cliente às duas opções exibidas no formulário.
export type TipoCliente = 'Pessoa física' | 'Pessoa jurídica';

// Representa um cliente enquanto ele é usado pelas telas e pelo serviço.
export interface ClienteModel {
    // O Firebase gera o ID e a data somente ao concluir o cadastro.
    id?: string;
    // Dados de identificação.
    tipoCliente: TipoCliente;
    nomeCliente: string;
    CpfCnpj: string;
    // Dados de contato.
    celular: string;
    email: string;
    contato: string;
    // Dados do endereço.
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    // Campo livre para informações que não cabem nos demais campos.
    observacoes: string;
    // Campos legados opcionais, mantidos para ler cadastros antigos.
    idade?: number | string;
    dataAtividade?: string;
    // Momento do cadastro em milissegundos desde 01/01/1970.
    createdAt?: number;
}
