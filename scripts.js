document.addEventListener('DOMContentLoaded', function() {
    let livros = []; // Será populado com os dados do Firebase
    let alugueis = []; // Será populado com os dados do Firebase

    const listaLivros = document.getElementById('lista-livros');
    const selectLivro = document.getElementById('livro');
    const adminPanel = document.getElementById('admin-panel');
    const formAcesso = document.getElementById('form-acesso');
    const formAdicionar = document.getElementById('form-adicionar');
    const formRemover = document.getElementById('form-remover');
    const formDevolucao = document.getElementById('form-devolucao');
    const tabelaAlugueis = document.getElementById('tabela').getElementsByTagName('tbody')[0];
    const senhaCorreta = 'admin123'; // Senha de acesso restrito (simulação)

    // Referência para o banco de dados do Firebase
    const db = firebase.database();
    const livrosRef = db.ref('livros');
    const alugueisRef = db.ref('alugueis');

    // Função para inicializar e sincronizar dados do Firebase
    function inicializarFirebase() {
        // Sincronizar livros
        livrosRef.on('value', function(snapshot) {
            livros = snapshot.val() || [];
            exibirLivros();
            exibirLivrosSelect();
        });

        // Sincronizar aluguéis
        alugueisRef.on('value', function(snapshot) {
            alugueis = snapshot.val() || [];
            atualizarTabelaAlugueis();
        });
    }

    // Inicialização do Firebase
    inicializarFirebase();

    // Função para exibir os livros disponíveis na lista
    function exibirLivros() {
        listaLivros.innerHTML = ''; // Limpa a lista antes de recriá-la
        livros.forEach(livro => {
            const li = document.createElement('li');
            li.textContent = `${livro.titulo} - Quantidade: ${livro.quantidade}`;
            if (!livro.disponivel) {
                li.classList.add('indisponivel');
            }
            listaLivros.appendChild(li);
        });
    }

    // Função para exibir os livros disponíveis no formulário de aluguel
    function exibirLivrosSelect() {
        selectLivro.innerHTML = ''; // Limpa o select antes de recriá-lo
        livros.forEach(livro => {
            if (livro.disponivel && livro.quantidade > 0) {
                const option = document.createElement('option');
                option.value = livro.id;
                option.textContent = livro.titulo;
                selectLivro.appendChild(option);
            }
        });
    }

    // Evento de submissão do formulário de aluguel
    const formAluguel = document.getElementById('form-aluguel');
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

        if (!livroSelecionado || !livroSelecionado.disponivel || livroSelecionado.quantidade <= 0) {
            alert('Livro selecionado não está disponível para aluguel!');
            return;
        }

        // Simulação do processo de aluguel
        alert(`Livro "${livroSelecionado.titulo}" alugado por ${nome}, da sala ${sala}!`);

        // Atualização da disponibilidade do livro e quantidade
        livroSelecionado.disponivel = false;
        livroSelecionado.quantidade -= 1;

        // Registrar o aluguel na lista de aluguéis
        const dataAluguel = new Date();
        const dataDevolucao = new Date();
        dataDevolucao.setDate(dataDevolucao.getDate() + 7); // Devolução em 7 dias

        const aluguel = {
            livro: livroSelecionado.titulo,
            nome: nome,
            sala: sala,
            dataAluguel: dataAluguel.toLocaleDateString(),
            dataDevolucao: dataDevolucao.toLocaleDateString(),
            codigoDevolucao: Math.floor(1000 + Math.random() * 9000), // Gerar código de devolução aleatório
            status: 'Dentro do prazo'
        };

        // Adicionar aluguel ao Firebase
        alugueisRef.push(aluguel);

        // Atualizar interface (localmente)
        exibirLivros();
        exibirLivrosSelect();
    });

    // Evento de submissão do formulário de acesso restrito
    formAcesso.addEventListener('submit', function(event) {
        event.preventDefault();

        const senha = document.getElementById('senha').value;

        if (senha === senhaCorreta) {
            adminPanel.style.display = 'block';
            formAcesso.reset();
        } else {
            alert('Senha incorreta! Tente novamente.');
        }
    });

    // Eventos de adicionar e remover livros (simulados)
    formAdicionar.addEventListener('submit', function(event) {
        event.preventDefault();
        const tituloLivro = document.getElementById('tituloLivro').value;
        const generoLivro = document.getElementById('generoLivro').value;
        const quantidadeLivro = parseInt(document.getElementById('quantidadeLivro').value);

        if (!tituloLivro || !generoLivro || isNaN(quantidadeLivro) || quantidadeLivro <= 0) {
            alert('Preencha todos os campos corretamente!');
            return;
        }

        // Simulação de adicionar um novo livro
        const novoLivro = {
            id: livros.length + 1,
            titulo: tituloLivro,
            genero: generoLivro,
            quantidade: quantidadeLivro,
            disponivel: true
        };

        // Adicionar livro ao Firebase
        livrosRef.push(novoLivro);

        // Limpar campos do formulário
        formAdicionar.reset();
    });

    formRemover.addEventListener('submit', function(event) {
        event.preventDefault();
        const livroId = parseInt(document.getElementById('livroId').value);
        if (isNaN(livroId)) {
            alert('Digite um ID válido do livro!');
            return;
        }
        const livroRemovido = livros.find(livro => livro.id === livroId);
        if (!livroRemovido) {
            alert('Livro não encontrado!');
            return;
        }

        // Remover livro do Firebase
        livrosRef.child(livroId).remove();

        // Limpar campos do formulário
        formRemover.reset();
    });

    formDevolucao.addEventListener('submit', function(event) {
        event.preventDefault();
        const codigoDevolucao = parseInt(document.getElementById('codigoDevolucao').value);
        if (isNaN(codigoDevolucao)) {
            alert('Digite um código de devolução válido!');
            return;
        }
        const aluguelDevolvido = alugueis.find(aluguel => aluguel.codigoDevolucao === codigoDevolucao);
        if (!aluguelDevolvido) {
            alert('Código de devolução não encontrado!');
            return;
        }

        // Remover aluguel do Firebase
        alugueisRef.child(aluguelDevolvido.codigoDevolucao).remove();

        // Atualizar a disponibilidade do livro devolvido (localmente)
        const livroDevolvido = livros.find(livro => livro.titulo === aluguelDevolvido.livro);
        livroDevolvido.disponivel = true;
        livroDevolvido.quantidade += 1;

        alert(`Livro "${aluguelDevolvido.livro}" devolvido com sucesso por ${aluguelDevolvido.nome}!`);

        // Atualizar interface (localmente)
        exibirLivros();
        exibirLivrosSelect();
    });

    // Função para atualizar a tabela de aluguéis
    function atualizarTabelaAlugueis() {
        tabelaAlugueis.innerHTML = ''; // Limpa a tabela antes de recriá-la
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

    // Exibir inicialmente os livros e a tabela de aluguéis
    exibirLivros();
    exibirLivrosSelect();
    atualizarTabelaAlugueis();
});
