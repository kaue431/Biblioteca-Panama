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
        listaLivros.innerHTML = '';
        for (let id in livros) {
            const livro = livros[id];
            const li = document.createElement('li');
            li.textContent = `${livro.titulo} - ${livro.genero} - Quantidade: ${livro.quantidade}`;
            listaLivros.appendChild(li);
        }
    }

    // Função para preencher o select com os livros disponíveis
    function exibirLivrosSelect() {
        selectLivro.innerHTML = '';
        for (let id in livros) {
            const livro = livros[id];
            const option = document.createElement('option');
            option.value = id;
            option.textContent = livro.titulo;
            selectLivro.appendChild(option);
        }
    }

    // Função para adicionar livro ao Firebase
    formAdicionar.addEventListener('submit', function(event) {
        event.preventDefault();
        const titulo = document.getElementById('tituloLivro').value;
        const genero = document.getElementById('generoLivro').value;
        const quantidade = parseInt(document.getElementById('quantidadeLivro').value, 10);

        const novoLivro = { titulo, genero, quantidade };
        livrosRef.push(novoLivro);

        formAdicionar.reset();
    });

    // Função para remover livro do Firebase
    formRemover.addEventListener('submit', function(event) {
        event.preventDefault();
        const id = document.getElementById('livroId').value;
        livrosRef.child(id).remove();
        formRemover.reset();
    });

    // Função para devolver livro ao Firebase
    formDevolucao.addEventListener('submit', function(event) {
        event.preventDefault();
        const codigoDevolucao = document.getElementById('codigoDevolucao').value;
        const aluguel = alugueis.find(aluguel => aluguel.codigoDevolucao == codigoDevolucao);

        if (aluguel) {
            const livro = livros[aluguel.livroId];
            livro.quantidade++;
            livrosRef.child(aluguel.livroId).update(livro);

            aluguel.status = 'Devolvido';
            alugueisRef.child(aluguel.id).update(aluguel);
            formDevolucao.reset();
        }
    });

    // Função para alugar livro
    document.getElementById('form-aluguel').addEventListener('submit', function(event) {
        event.preventDefault();
        const nome = document.getElementById('nome').value;
        const sala = document.getElementById('sala').value;
        const livroId = document.getElementById('livro').value;
        const livro = livros[livroId];
        const dataAluguel = new Date().toISOString().split('T')[0]; // Data atual
        const codigoDevolucao = Date.now(); // Código de devolução único
        const dataDevolucao = ''; // Pode ser preenchido no momento da devolução
        const status = 'Alugado';

        if (livro.quantidade > 0) {
            livro.quantidade--;
            livrosRef.child(livroId).update(livro);

            const novoAluguel = { livroId, nome, sala, dataAluguel, dataDevolucao, codigoDevolucao, status };
            alugueisRef.push(novoAluguel);

            document.getElementById('form-aluguel').reset();
        }
    });

    // Função para atualizar a tabela de aluguéis
    function atualizarTabelaAlugueis() {
        tabelaAlugueis.innerHTML = '';
        for (let id in alugueis) {
            const aluguel = alugueis[id];
            const livro = livros[aluguel.livroId];
            const row = tabelaAlugueis.insertRow();
            row.insertCell(0).textContent = livro.titulo;
            row.insertCell(1).textContent = aluguel.nome;
            row.insertCell(2).textContent = aluguel.sala;
            row.insertCell(3).textContent = aluguel.dataAluguel;
            row.insertCell(4).textContent = aluguel.dataDevolucao;
            row.insertCell(5).textContent = aluguel.codigoDevolucao;
            row.insertCell(6).textContent = aluguel.status;
            row.classList.add(aluguel.status === 'Devolvido' ? 'dentro-do-prazo' : 'atrasado');
        }
    }

    // Função de controle de acesso administrativo
    formAcesso.addEventListener('submit', function(event) {
        event.preventDefault();
        const senha = document.getElementById('senha').value;
        if (senha === senhaCorreta) {
            adminPanel.style.display = 'block';
            formAcesso.style.display = 'none';
        } else {
            alert('Senha incorreta!');
        }
    });
});
