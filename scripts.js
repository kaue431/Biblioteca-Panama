document.addEventListener('DOMContentLoaded', function() {
    // Lista de livros e alugueis armazenados localmente ou iniciados
    let livros = JSON.parse(localStorage.getItem('livros')) || [
        { id: 1, titulo: 'Dom Casmurro', genero: 'Romance', quantidade: 3, disponivel: true },
        { id: 2, titulo: 'Memórias Póstumas de Brás Cubas', genero: 'Romance', quantidade: 2, disponivel: true },
        { id: 3, titulo: 'O Cortiço', genero: 'Romance', quantidade: 1, disponivel: true },
        { id: 4, titulo: 'Vidas Secas', genero: 'Romance', quantidade: 4, disponivel: true },
        { id: 5, titulo: 'Grande Sertão: Veredas', genero: 'Romance', quantidade: 2, disponivel: true }
    ];

    let alugueis = JSON.parse(localStorage.getItem('alugueis')) || [];

    // Elementos do DOM
    const listaLivros = document.getElementById('lista-livros');
    const selectLivro = document.getElementById('livro');
    const adminPanel = document.getElementById('admin-panel');
    const formAcesso = document.getElementById('form-acesso');
    const formAdicionar = document.getElementById('form-adicionar');
    const formRemover = document.getElementById('form-remover');
    const formDevolucao = document.getElementById('form-devolucao');
    const tabelaAlugueis = document.getElementById('tabela').getElementsByTagName('tbody')[0];
    const pesquisaLivro = document.getElementById('pesquisa-livro');
    const formAluguel = document.getElementById('form-aluguel');
    const senhaCorreta = '2reaisnopix';

    // Função para exibir livros na lista e no select
    function exibirLivros(filtro = '') {
        listaLivros.innerHTML = '';
        livros.filter(livro => livro.titulo.toLowerCase().includes(filtro.toLowerCase()))
            .forEach(livro => {
                const li = document.createElement('li');
                li.textContent = `${livro.titulo} - Quantidade: ${livro.quantidade}`;
                if (livro.quantidade === 0) {
                    li.classList.add('indisponivel');
                }
                listaLivros.appendChild(li);
            });
    }

    function exibirLivrosSelect(filtro = '') {
        selectLivro.innerHTML = '';
        livros.filter(livro => livro.titulo.toLowerCase().includes(filtro.toLowerCase()) && livro.quantidade > 0)
            .forEach(livro => {
                const option = document.createElement('option');
                option.value = livro.id;
                option.textContent = livro.titulo;
                selectLivro.appendChild(option);
            });
    }

    // Função para atualizar a tabela de aluguéis
    function atualizarTabelaAlugueis() {
        tabelaAlugueis.innerHTML = '';

        alugueis.forEach(aluguel => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${aluguel.livro}</td>
                <td>${aluguel.nome}</td>
                <td>${aluguel.sala}</td>
                <td>${aluguel.dataAluguel}</td>
                <td>${aluguel.dataDevolucao}</td>
                <td>${aluguel.codigoDevolucao}</td>
                <td>${aluguel.status}</td>
            `;
            tabelaAlugueis.appendChild(tr);
        });
    }

    // Alugar Livro
    formAluguel.addEventListener('submit', function(event) {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const sala = document.getElementById('sala').value;
        const livroId = parseInt(selectLivro.value);

        if (!nome || !sala || isNaN(livroId)) {
            alert('Preencha todos os campos!');
            return;
        }

        const livroSelecionado = livros.find(livro => livro.id === livroId);

        if (!livroSelecionado || livroSelecionado.quantidade <= 0) {
            alert('Livro selecionado não está disponível para aluguel!');
            return;
        }

        alert(`Livro "${livroSelecionado.titulo}" alugado por ${nome}, da sala ${sala}!`);

        livroSelecionado.quantidade -= 1;
        if (livroSelecionado.quantidade === 0) {
            livroSelecionado.disponivel = false;
        }

        const dataAluguel = new Date();
        const dataDevolucao = new Date();
        dataDevolucao.setDate(dataDevolucao.getDate() + 7); // Devolução em 7 dias
        const codigoDevolucao = Math.floor(Math.random() * 100000);

        const novoAluguel = {
            nome: nome,
            sala: sala,
            livro: livroSelecionado.titulo,
            dataAluguel: dataAluguel.toLocaleDateString(),
            dataDevolucao: dataDevolucao.toLocaleDateString(),
            codigoDevolucao: codigoDevolucao,
            status: 'Alugado'
        };

        alugueis.push(novoAluguel);

        formAluguel.reset();
        exibirLivros();
        exibirLivrosSelect();
        atualizarTabelaAlugueis();

        localStorage.setItem('livros', JSON.stringify(livros));
        localStorage.setItem('alugueis', JSON.stringify(alugueis));
    });

    // Acesso ao painel administrativo
    formAcesso.addEventListener('submit', function(event) {
        event.preventDefault();

        const senha = document.getElementById('senha').value;

        if (senha === senhaCorreta) {
            alert('Acesso concedido!');
            adminPanel.style.display = 'block';
        } else {
            alert('Senha incorreta!');
        }
    });

    // Adicionar Livro
    formAdicionar.addEventListener('submit', function(event) {
        event.preventDefault();

        const titulo = document.getElementById('tituloLivro').value;
        const genero = document.getElementById('generoLivro').value;
        const quantidade = parseInt(document.getElementById('quantidadeLivro').value);

        if (!titulo || !genero || isNaN(quantidade)) {
            alert('Preencha todos os campos!');
            return;
        }

        const novoLivro = {
            id: livros.length + 1,
            titulo: titulo,
            genero: genero,
            quantidade: quantidade,
            disponivel: quantidade > 0
        };

        livros.push(novoLivro);

        formAdicionar.reset();
        exibirLivros();
        exibirLivrosSelect();

        localStorage.setItem('livros', JSON.stringify(livros));
    });

    // Remover Livro
    formRemover.addEventListener('submit', function(event) {
        event.preventDefault();

        const livroId = parseInt(document.getElementById('livroId').value);

        if (isNaN(livroId)) {
            alert('ID inválido!');
            return;
        }

        const index = livros.findIndex(livro => livro.id === livroId);

        if (index === -1) {
            alert('Livro não encontrado!');
            return;
        }

        livros.splice(index, 1);

        formRemover.reset();
        exibirLivros();
        exibirLivrosSelect();

        localStorage.setItem('livros', JSON.stringify(livros));
    });

    // Devolução de Livro
    formDevolucao.addEventListener('submit', function(event) {
        event.preventDefault();

        const codigoDevolucao = parseInt(document.getElementById('codigoDevolucao').value);

        if (isNaN(codigoDevolucao)) {
            alert('Código de devolução inválido!');
            return;
        }

        const aluguel = alugueis.find(a => a.codigoDevolucao === codigoDevolucao);

        if (!aluguel) {
            alert('Código de devolução não encontrado!');
            return;
        }

        aluguel.status = 'Devolvido';
        const livroDevolvido = livros.find(livro => livro.titulo === aluguel.livro);
        livroDevolvido.quantidade += 1;
        livroDevolvido.disponivel = true;

        formDevolucao.reset();
        exibirLivros();
        exibirLivrosSelect();
        atualizarTabelaAlugueis();

        localStorage.setItem('livros', JSON.stringify(livros));
        localStorage.setItem('alugueis', JSON.stringify(alugueis));
    });

    // Filtragem de livros na pesquisa
    pesquisaLivro.addEventListener('input', function() {
        const filtro = pesquisaLivro.value;
        exibirLivros(filtro);
        exibirLivrosSelect(filtro);
    });

    // Inicializar com os livros e alugueis já existentes
    exibirLivros();
    exibirLivrosSelect();
    atualizarTabelaAlugueis();
});
