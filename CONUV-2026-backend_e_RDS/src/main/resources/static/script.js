
const API_PRODUTOS = "/produtos";
const API_CLIENTES = "/clientes";
const API_VENDAS = "/vendas";

let cacheProdutos = [];
let cacheClientes = [];

function exibirMensagem(elementoMensagem, texto, erro = false) {
    if (!elementoMensagem) return;
    elementoMensagem.textContent = texto;
    elementoMensagem.style.color = erro ? "red" : "green";
}

// Faz a requisição HTTP e trata erros
async function requisitar(url, metodo = "GET", dados = null) {
    const opcoes = {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (dados !== null) {
        opcoes.body = JSON.stringify(dados);
    }

    const resposta = await fetch(url, opcoes);

    if (!resposta.ok) {
        const detalhe = await resposta.text();
        throw new Error(detalhe || `Erro HTTP ${resposta.status}`);
    }

    
    const textoResposta = await resposta.text();
    return textoResposta ? JSON.parse(textoResposta) : [];
}

document.querySelectorAll(".aba").forEach(botao => {
    botao.addEventListener("click", () => {
        document.querySelectorAll(".aba").forEach(b => b.classList.remove("ativa"));
        document.querySelectorAll(".secao").forEach(s => s.hidden = true);

        botao.classList.add("ativa");
        document.getElementById(botao.dataset.alvo).hidden = false;
    });
});


// PRODUTOS
const formProduto = document.getElementById("produtoForm");
const campoProdutoId = document.getElementById("produtoId") || document.getElementById("id");
const campoProdutoNome = document.getElementById("produtoNome") || document.getElementById("nome");
const campoProdutoDescricao = document.getElementById("produtoDescricao") || document.getElementById("descricao");
const campoProdutoPreco = document.getElementById("produtoPreco") || document.getElementById("preco");
const btnSalvarProduto = document.getElementById("btnSalvarProduto") || document.getElementById("btnSalvar");
const btnCancelarProduto = document.getElementById("btnCancelarProduto") || document.getElementById("btnCancelar");
const listaProdutos = document.getElementById("listaProdutos");
const mensagemProduto = document.getElementById("mensagemProduto") || document.getElementById("mensagem");

function renderizarProdutos(produtos) {
    cacheProdutos = produtos; 
    listaProdutos.replaceChildren();

    produtos.forEach(produto => {
        const linha = document.createElement("tr");

        function adicionarCelula(valor) {
            const celula = document.createElement("td");
            celula.textContent = valor ?? "";
            linha.appendChild(celula);
            return celula;
        }

        adicionarCelula(produto.id);
        adicionarCelula(produto.nome);
        adicionarCelula(produto.descricao);
        adicionarCelula(
            Number(produto.preco).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })
        );

        const celulaAcoes = document.createElement("td");
        celulaAcoes.className = "acoes";

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.type = "button";
        btnEditar.className = "editar";
        btnEditar.addEventListener("click", () => editarProduto(produto));

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.type = "button";
        btnExcluir.className = "excluir";
        btnExcluir.addEventListener("click", () => excluirProduto(produto.id));

        celulaAcoes.append(btnEditar, btnExcluir);
        linha.appendChild(celulaAcoes);
        listaProdutos.appendChild(linha);
    });

    atualizarSelectsVendas();
}

async function carregarProdutos() {
    try {
        const produtos = await requisitar(API_PRODUTOS);
        renderizarProdutos(produtos);
    } catch (erro) {
        exibirMensagem(mensagemProduto, `Erro ao carregar produtos: ${erro.message}`, true);
    }
}

function editarProduto(produto) {
    campoProdutoId.value = produto.id;
    campoProdutoNome.value = produto.nome;
    campoProdutoDescricao.value = produto.descricao ?? "";
    campoProdutoPreco.value = produto.preco;

    btnSalvarProduto.textContent = "Salvar alterações";
    if (btnCancelarProduto) btnCancelarProduto.hidden = false;

    exibirMensagem(mensagemProduto, `Editando o produto ${produto.nome}.`);
    campoProdutoNome.focus();
}

function limparFormularioProduto() {
    formProduto.reset();
    campoProdutoId.value = "";
    btnSalvarProduto.textContent = "Cadastrar";
    if (btnCancelarProduto) btnCancelarProduto.hidden = true;
}

formProduto.addEventListener("submit", async evento => {
    evento.preventDefault();
    const id = campoProdutoId.value;

    const produto = {
        nome: campoProdutoNome.value.trim(),
        descricao: campoProdutoDescricao.value.trim(),
        preco: Number(campoProdutoPreco.value)
    };

    if (id) produto.id = Number(id);

    try {
        const produtos = await requisitar(API_PRODUTOS, id ? "PUT" : "POST", produto);
        renderizarProdutos(produtos);
        limparFormularioProduto();
        exibirMensagem(mensagemProduto, id ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
    } catch (erro) {
        exibirMensagem(mensagemProduto, `Erro ao salvar produto: ${erro.message}`, true);
    }
});

async function excluirProduto(id) {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    try {
        const produtos = await requisitar(`${API_PRODUTOS}/${id}`, "DELETE");
        renderizarProdutos(produtos);
        if (campoProdutoId.value === String(id)) limparFormularioProduto();
        exibirMensagem(mensagemProduto, "Produto excluído com sucesso!");
    } catch (erro) {
        exibirMensagem(mensagemProduto, `Erro ao excluir produto: ${erro.message}`, true);
    }
}

if (btnCancelarProduto) {
    btnCancelarProduto.addEventListener("click", () => {
        limparFormularioProduto();
        exibirMensagem(mensagemProduto, "Edição cancelada.");
    });
}


// CLIENTES
const formCliente = document.getElementById("clienteForm");
const campoClienteId = document.getElementById("clienteId");
const campoClienteNome = document.getElementById("clienteNome");
const campoClienteCpf = document.getElementById("clienteCpf");
const campoClienteIdade = document.getElementById("clienteIdade");
const campoClienteProfissao = document.getElementById("clienteProfissao");
const campoClienteEndereco = document.getElementById("clienteEndereco");
const btnSalvarCliente = document.getElementById("btnSalvarCliente");
const btnCancelarCliente = document.getElementById("btnCancelarCliente");
const listaClientes = document.getElementById("listaClientes");
const mensagemCliente = document.getElementById("mensagemCliente");

function renderizarClientes(clientes) {
    cacheClientes = clientes; // Atualiza o cache para usar nas Vendas
    if (!listaClientes) return;
    listaClientes.replaceChildren();

    clientes.forEach(cliente => {
        const linha = document.createElement("tr");

        function adicionarCelula(valor) {
            const celula = document.createElement("td");
            celula.textContent = valor ?? "";
            linha.appendChild(celula);
            return celula;
        }

        adicionarCelula(cliente.id);
        adicionarCelula(cliente.nome);
        adicionarCelula(cliente.cpf);
        adicionarCelula(cliente.idade);
        adicionarCelula(cliente.profissao);
        adicionarCelula(cliente.endereco);

        const celulaAcoes = document.createElement("td");
        celulaAcoes.className = "acoes";

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.type = "button";
        btnEditar.className = "editar";
        btnEditar.addEventListener("click", () => editarCliente(cliente));

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.type = "button";
        btnExcluir.className = "excluir";
        btnExcluir.addEventListener("click", () => excluirCliente(cliente.id));

        celulaAcoes.append(btnEditar, btnExcluir);
        linha.appendChild(celulaAcoes);
        listaClientes.appendChild(linha);
    });

    atualizarSelectsVendas();
}

async function carregarClientes() {
    try {
        const clientes = await requisitar(API_CLIENTES);
        renderizarClientes(clientes);
    } catch (erro) {
        exibirMensagem(mensagemCliente, `Erro ao carregar clientes: ${erro.message}`, true);
    }
}

function editarCliente(cliente) {
    campoClienteId.value = cliente.id;
    campoClienteNome.value = cliente.nome;
    campoClienteCpf.value = cliente.cpf ?? "";
    campoClienteIdade.value = cliente.idade ?? "";
    campoClienteProfissao.value = cliente.profissao ?? "";
    campoClienteEndereco.value = cliente.endereco ?? "";

    btnSalvarCliente.textContent = "Salvar alterações";
    if (btnCancelarCliente) btnCancelarCliente.hidden = false;

    exibirMensagem(mensagemCliente, `Editando o cliente ${cliente.nome}.`);
    campoClienteNome.focus();
}

function limparFormularioCliente() {
    formCliente.reset();
    campoClienteId.value = "";
    btnSalvarCliente.textContent = "Cadastrar";
    if (btnCancelarCliente) btnCancelarCliente.hidden = true;
}

if (formCliente) {
    formCliente.addEventListener("submit", async evento => {
        evento.preventDefault();
        const id = campoClienteId.value;

        const cliente = {
            nome: campoClienteNome.value.trim(),
            cpf: campoClienteCpf.value.trim(),
            idade: Number(campoClienteIdade.value),
            profissao: campoClienteProfissao.value.trim(),
            endereco: campoClienteEndereco.value.trim()
        };

        if (id) cliente.id = Number(id);

        try {
            const clientes = await requisitar(API_CLIENTES, id ? "PUT" : "POST", cliente);
            renderizarClientes(clientes);
            limparFormularioCliente();
            exibirMensagem(mensagemCliente, id ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!");
        } catch (erro) {
            exibirMensagem(mensagemCliente, `Erro ao salvar cliente: ${erro.message}`, true);
        }
    });
}

async function excluirCliente(id) {
    if (!confirm("Deseja realmente excluir este cliente?")) return;

    try {
        const clientes = await requisitar(`${API_CLIENTES}/${id}`, "DELETE");
        renderizarClientes(clientes);
        if (campoClienteId.value === String(id)) limparFormularioCliente();
        exibirMensagem(mensagemCliente, "Cliente excluído com sucesso!");
    } catch (erro) {
        exibirMensagem(mensagemCliente, `Erro ao excluir cliente: ${erro.message}`, true);
    }
}

if (btnCancelarCliente) {
    btnCancelarCliente.addEventListener("click", () => {
        limparFormularioCliente();
        exibirMensagem(mensagemCliente, "Edição cancelada.");
    });
}


// VENDAS 
const formVenda = document.getElementById("vendaForm");
const campoVendaId = document.getElementById("vendaId");
const campoVendaData = document.getElementById("vendaData");
const campoVendaLoja = document.getElementById("vendaLoja");
const selectVendaCliente = document.getElementById("vendaCliente");
const selectVendaProduto = document.getElementById("vendaProduto");
const campoVendaQuantidade = document.getElementById("vendaQuantidade");
const campoVendaValor = document.getElementById("vendaValor");
const btnSalvarVenda = document.getElementById("btnSalvarVenda");
const btnCancelarVenda = document.getElementById("btnCancelarVenda");
const listaVendas = document.getElementById("listaVendas");
const mensagemVenda = document.getElementById("mensagemVenda");


function atualizarSelectsVendas() {
    if (selectVendaCliente) {
        selectVendaCliente.innerHTML = `<option value="">Selecione um cliente</option>` +
            cacheClientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join("");
    }

    if (selectVendaProduto) {
        selectVendaProduto.innerHTML = `<option value="">Selecione um produto</option>` +
            cacheProdutos.map(p => `<option value="${p.id}">${p.nome} — R$ ${Number(p.preco).toFixed(2).replace('.', ',')}</option>`).join("");
    }
}

function calcularValorVenda() {
    if (!selectVendaProduto || !campoVendaQuantidade || !campoVendaValor) return;
    const produtoId = Number(selectVendaProduto.value);
    const quantidade = Number(campoVendaQuantidade.value) || 0;
    
    const produto = cacheProdutos.find(p => p.id === produtoId);
    const total = produto ? produto.preco * quantidade : 0;

    campoVendaValor.value = total.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

if (selectVendaProduto) selectVendaProduto.addEventListener("change", calcularValorVenda);
if (campoVendaQuantidade) campoVendaQuantidade.addEventListener("input", calcularValorVenda);

function renderizarVendas(vendas) {
    if (!listaVendas) return;
    listaVendas.replaceChildren();

    vendas.forEach(venda => {
        const linha = document.createElement("tr");

        function adicionarCelula(valor) {
            const celula = document.createElement("td");
            celula.textContent = valor ?? "";
            linha.appendChild(celula);
            return celula;
        }

        const clienteId = venda.id_cliente ?? venda.idCliente;
        const produtoId = venda.id_produto ?? venda.idProduto;
        const valorVenda = venda.valor_venda ?? venda.valorVenda;

        const clienteObj = cacheClientes.find(c => c.id === clienteId);
        const produtoObj = cacheProdutos.find(p => p.id === produtoId);

        adicionarCelula(venda.id);
        adicionarCelula(venda.data);
        adicionarCelula(venda.loja);
        adicionarCelula(clienteObj ? clienteObj.nome : `ID ${clienteId}`);
        adicionarCelula(produtoObj ? produtoObj.nome : `ID ${produtoId}`);
        adicionarCelula(venda.quantidade);
        adicionarCelula(
            Number(valorVenda).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })
        );

        const celulaAcoes = document.createElement("td");
        celulaAcoes.className = "acoes";

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.type = "button";
        btnEditar.className = "editar";
        btnEditar.addEventListener("click", () => editarVenda(venda));

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.type = "button";
        btnExcluir.className = "excluir";
        btnExcluir.addEventListener("click", () => excluirVenda(venda.id));

        celulaAcoes.append(btnEditar, btnExcluir);
        linha.appendChild(celulaAcoes);
        listaVendas.appendChild(linha);
    });
}

async function carregarVendas() {
    try {
        const vendas = await requisitar(API_VENDAS);
        renderizarVendas(vendas);
    } catch (erro) {
        exibirMensagem(mensagemVenda, `Erro ao carregar vendas: ${erro.message}`, true);
    }
}

function editarVenda(venda) {
    campoVendaId.value = venda.id;
    campoVendaData.value = venda.data ?? "";
    campoVendaLoja.value = venda.loja ?? "";
    selectVendaCliente.value = venda.id_cliente ?? venda.idCliente ?? "";
    selectVendaProduto.value = venda.id_produto ?? venda.idProduto ?? "";
    campoVendaQuantidade.value = venda.quantidade ?? 1;
    calcularValorVenda();

    btnSalvarVenda.textContent = "Salvar alterações";
    if (btnCancelarVenda) btnCancelarVenda.hidden = false;

    exibirMensagem(mensagemVenda, `Editando a venda #${venda.id}.`);
    campoVendaData.focus();
}

function limparFormularioVenda() {
    formVenda.reset();
    campoVendaId.value = "";
    if (campoVendaValor) campoVendaValor.value = "0,00";
    btnSalvarVenda.textContent = "Cadastrar";
    if (btnCancelarVenda) btnCancelarVenda.hidden = true;
}

if (formVenda) {
    formVenda.addEventListener("submit", async evento => {
        evento.preventDefault();
        const id = campoVendaId.value;

        const produtoId = Number(selectVendaProduto.value);
        const quantidade = Number(campoVendaQuantidade.value);
        const produto = cacheProdutos.find(p => p.id === produtoId);
        const valorCalculado = produto ? produto.preco * quantidade : 0;

        const venda = {
            data: campoVendaData.value,
            loja: campoVendaLoja.value.trim(),
            id_cliente: Number(selectVendaCliente.value),
            id_produto: produtoId,
            quantidade: quantidade,
            valor_venda: valorCalculado
        };

        if (id) venda.id = Number(id);

        try {
            const vendas = await requisitar(API_VENDAS, id ? "PUT" : "POST", venda);
            renderizarVendas(vendas);
            limparFormularioVenda();
            exibirMensagem(mensagemVenda, id ? "Venda atualizada com sucesso!" : "Venda cadastrada com sucesso!");
        } catch (erro) {
            exibirMensagem(mensagemVenda, `Erro ao salvar venda: ${erro.message}`, true);
        }
    });
}

async function excluirVenda(id) {
    if (!confirm("Deseja realmente excluir esta venda?")) return;

    try {
        const vendas = await requisitar(`${API_VENDAS}/${id}`, "DELETE");
        renderizarVendas(vendas);
        if (campoVendaId.value === String(id)) limparFormularioVenda();
        exibirMensagem(mensagemVenda, "Venda excluída com sucesso!");
    } catch (erro) {
        exibirMensagem(mensagemVenda, `Erro ao excluir venda: ${erro.message}`, true);
    }
}

if (btnCancelarVenda) {
    btnCancelarVenda.addEventListener("click", () => {
        limparFormularioVenda();
        exibirMensagem(mensagemVenda, "Edição cancelada.");
    });
}


// ================= INICIALIZAÇÃO GERAL =================
async function inicializarSistema() {
    await carregarClientes();
    await carregarProdutos();
    await carregarVendas();
}

inicializarSistema();