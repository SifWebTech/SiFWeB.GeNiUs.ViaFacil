/* Testes locais: simulam Firebase; nao acessam nem alteram o banco real. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function load(file, dependencies) {
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(source, {
        exports, Date, console: { error() {} },
        require: name => dependencies[name] ?? require(name),
    }, { filename: file });
    return exports;
}

function firebaseHarness() {
    const data = {};
    const auth = { currentUser: { uid: 'test-user' } };
    const listeners = new Map();
    let sequence = 0;
    let denied = false;
    const copy = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
    const read = path => path.split('/').filter(Boolean).reduce((value, key) => value?.[key], data);
    const snapshot = path => ({ exists: () => read(path) != null, val: () => copy(read(path)) ?? null });
    function check() { if (denied) throw new Error('PERMISSION_DENIED'); }
    function write(path, value) {
        check();
        assert(!Object.values(value ?? {}).includes(undefined));
        const keys = path.split('/').filter(Boolean);
        let parent = data;
        for (const key of keys.slice(0, -1)) parent = parent[key] ??= {};
        if (value === null) delete parent[keys.at(-1)];
        else parent[keys.at(-1)] = copy(value);
        for (const [watched, callbacks] of listeners) {
            if (path === watched || path.startsWith(watched + '/')) {
                for (const callback of callbacks) callback(snapshot(watched));
            }
        }
    }
    const db = {
        ref: (_, path = '') => ({ path }),
        child: (parent, path) => ({ path: [parent.path, path].filter(Boolean).join('/') }),
        push: parent => { const key = 'item-' + ++sequence; return { key, path: parent.path + '/' + key }; },
        async update(item, value) { write(item.path, { ...read(item.path), ...value }); },
        async set(item, value) { write(item.path, value); },
        async remove(item) { write(item.path, null); },
        async get(item) { check(); return snapshot(item.path); },
        onValue(item, callback, onError) {
            try { check(); } catch (error) { onError(error); return () => {}; }
            const callbacks = listeners.get(item.path) ?? new Set();
            callbacks.add(callback);
            listeners.set(item.path, callbacks);
            callback(snapshot(item.path));
            return () => callbacks.delete(callback);
        },
    };
    const dependencies = { 'firebase/database': db, './firebaseConfig': { auth, database: {} } };
    return {
        auth, read, deny: value => { denied = value; },
        clients: load('src/services/ClienteService.tsx', dependencies).ClienteService,
        office: load('src/services/officeData.ts', dependencies),
    };
}

const draft = {
    tipoCliente: 'Pessoa f\u00edsica', nomeCliente: 'Cliente teste', CpfCnpj: '529.982.247-25',
    celular: '(11) 99999-9999', email: 'teste@example.test', contato: '', cep: '01001-000',
    logradouro: 'Rua teste', numero: '1', complemento: '', bairro: 'Centro', cidade: 'Sao Paulo', uf: 'SP', observacoes: '',
};

test('CPF e CNPJ: aceita validos e rejeita digitos errados, repetidos e tipo incorreto', () => {
    const { clients: C } = firebaseHarness();
    const pf = 'Pessoa f\u00edsica', pj = 'Pessoa jur\u00eddica';
    for (const value of ['529.982.247-25', '11144477735', '01234567890']) assert(C.validarCpfCnpj(value, pf), value);
    for (const value of ['04.252.011/0001-10', '11222333000181']) assert(C.validarCpfCnpj(value, pj), value);
    for (const value of ['', '52998224724', '52998224715', '00000000000', '11111111111', '123', 'abc52998224725']) assert(!C.validarCpfCnpj(value, pf), value);
    for (const value of ['04252011000111', '04252011000100', '00000000000000', '11111111111111']) assert(!C.validarCpfCnpj(value, pj), value);
    assert(!C.validarCpfCnpj('52998224725', pj));
    assert(!C.validarCampos({ ...draft, CpfCnpj: '52998224724' }).valido);
    assert(C.validarCampos(draft).valido);
});

test('cadastro, edicao e exclusao atualizam leituras de clientes usadas pelo painel e processos', async () => {
    const h = firebaseHarness();
    let visible = [], emissions = 0;
    const stop = h.office.subscribeClients(items => { visible = items; emissions++; }, error => { throw error; });
    assert.equal(visible.length, 0);
    const created = await h.clients.criar(draft);
    assert.equal(visible.length, 1);
    assert.equal(visible[0].name, draft.nomeCliente);
    assert.equal(visible[0].document, draft.CpfCnpj);
    assert.equal(visible[0].phone, draft.celular);
    assert.equal(visible[0].id, created.id);
    assert.equal(typeof visible[0].createdAt, 'number');
    assert(!Object.values(h.read('usuarios/test-user/clients/' + created.id)).includes(undefined));
    assert.equal((await h.clients.listarTodos())[0].nomeCliente, draft.nomeCliente);
    await h.clients.atualizar(created.id, { nomeCliente: 'Cliente editado' });
    assert.equal(visible[0].name, 'Cliente editado');
    assert.equal((await h.clients.obterPorId(created.id)).celular, draft.celular);
    await h.clients.excluir(created.id);
    assert.equal(visible.length, 0);
    assert.equal(await h.clients.obterPorId(created.id), null);
    assert.equal((await h.clients.listarTodos()).length, 0);
    assert.equal(emissions, 4);
    stop();
    await h.clients.criar(draft);
    assert.equal(emissions, 4);
});

test('processos e configuracoes chegam aos assinantes de painel e relatorios', async () => {
    const h = firebaseHarness();
    const client = await h.clients.criar(draft);
    let processes, settings;
    h.office.subscribeProcesses(items => { processes = items; }, error => { throw error; });
    h.office.subscribeSettings(value => { settings = value; }, error => { throw error; });
    assert.equal(settings.defaultState, 'SP');
    await h.office.createProcess({ clientId: client.id, clientName: client.nomeCliente, title: 'AVCB teste', protocol: '', kind: 'AVCB', status: 'Em prepara\u00e7\u00e3o', propertyAddress: 'Rua teste', municipality: 'Sao Paulo', occupancy: '', area: '', floors: '', responsible: '', dueDate: '', notes: '' });
    assert.equal(processes.length, 1);
    assert.equal(processes[0].clientId, client.id);
    assert.equal(processes[0].title, 'AVCB teste');
    await h.office.saveSettings({ ...h.office.defaultSettings, officeName: 'Escritorio teste', defaultCity: 'Santos' });
    assert.equal(settings.officeName, 'Escritorio teste');
    assert.equal(settings.defaultCity, 'Santos');
    await h.clients.excluir(client.id);
    assert.equal(processes.length, 1);
});

test('falhas do Firebase sao propagadas e usuarios usam caminhos separados', async () => {
    const h = firebaseHarness();
    await h.clients.criar(draft);
    h.auth.currentUser = { uid: 'other-user' };
    assert.equal((await h.clients.listarTodos()).length, 0);
    h.deny(true);
    await assert.rejects(() => h.clients.criar(draft));
    await assert.rejects(() => h.clients.listarTodos());
    await assert.rejects(() => h.clients.excluir('item-1'));
    let failure;
    h.office.subscribeClients(() => assert.fail('Nao deve emitir sucesso'), error => { failure = error; });
    assert.equal(failure.message, 'PERMISSION_DENIED');
    h.deny(false);
    h.auth.currentUser = null;
    await assert.rejects(() => h.clients.criar(draft));
});

function alertHarness(platform) {
    let state = null;
    const nativeCalls = [];
    const { useAppAlert } = load('src/components/useAppAlert.tsx', {
        react: { useState: () => [state, value => { state = value; }], useCallback: callback => callback },
        'react-native': {
            Platform: { OS: platform }, Alert: { alert: (...args) => nativeCalls.push(args) },
            Modal: 'Modal', ScrollView: 'ScrollView', Text: 'Text', TouchableOpacity: 'Button', View: 'View',
            StyleSheet: { create: value => value },
        },
    });
    return { render: useAppAlert, nativeCalls };
}
function buttons(node) {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(buttons);
    return [...(node.type === 'Button' ? [node] : []), ...buttons(node.props?.children)];
}

test('web exibe mensagem e executa somente a acao escolhida', () => {
    const h = alertHarness('web');
    let confirmed = 0;
    h.render().showAlert('Excluir cliente', 'Confirma?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', onPress: () => confirmed++ }]);
    let dialog = h.render().alertDialog;
    assert.equal(dialog.type, 'Modal');
    assert(JSON.stringify(dialog).includes('Excluir cliente'));
    buttons(dialog)[0].props.onPress();
    assert.equal(confirmed, 0);
    assert.equal(h.render().alertDialog, null);
    h.render().showAlert('Salvo', 'Cadastro concluido', [{ text: 'Voltar', onPress: () => confirmed++ }]);
    dialog = h.render().alertDialog;
    buttons(dialog)[0].props.onPress();
    assert.equal(confirmed, 1);
    assert.equal(h.render().alertDialog, null);
    assert.equal(h.nativeCalls.length, 0);
    h.render().showAlert('Erro', 'Sem permissao');
    assert.equal(buttons(h.render().alertDialog).length, 1);
});

test('celular preserva Alert nativo', () => {
    const h = alertHarness('android');
    h.render().showAlert('Salvo', 'Cliente salvo');
    assert.equal(h.nativeCalls.length, 1);
    assert.equal(h.nativeCalls[0][0], 'Salvo');
    assert.equal(h.render().alertDialog, null);
});
