document.addEventListener('DOMContentLoaded', function() {
    // Inicialização dos dados a partir do localStorage, se existirem, ou dados padrão
    let livros = JSON.parse(localStorage.getItem('livros')) || [
        { id: 1, titulo: 'Dom Casmurro', genero: 'Romance', quantidade: 3, disponivel: true },
        { id: 2, titulo: 'Memórias Póstumas de Brás Cubas', genero: 'Romance', quantidade: 2, disponivel: true },
        { id: 3, titulo: 'O Cortiço', genero: 'Romance', quantidade: 1, disponivel: true },
        { id: 4, titulo: 'Vidas Secas', genero: 'Romance', quantidade: 4, disponivel: true },
        { id: 5, titulo: 'Grande Sertão: Veredas', genero: 'Romance', quantidade: 2, disponivel: true }
    ];

    let alugueis = JSON.parse(localStorage.getItem('alugueis')) || [];

    const listaLivros = document.getElementById('lista-livros');
    const selectLivro = document.getElementById('livro');
    const adminPanel = document.getElementById('admin-panel');
    const formAcesso = document.getElementById('form-acesso');
    const formAdicionar = document.getElementById('form-adicionar');
    const formRemover = document.getElementById('form-remover');
    const formDevolucao = document.getElementById('form-devolucao');
    const tabelaAlugueis = document.getElementById('tabela').getElementsByTagName('tbody')[0];
    const senhaCorreta = 'admin123'; // Senha de acesso restrito (simulação)

    // Função para exibir os livros disponíveis na lista
    function exibirLivros() {
        listaLivros.innerHTML = ''; // Limpa a lista antes de recriá-la
        livros.forEach(livro => {
            const li = document.createElement('li');
            li.textContent = ${livro.titulo} - Quantidade: ${livro.quantidade};
            if (!livro.disponivel && livro.quantidade > 0) {
                li.classList.add('indisponivel');
            }
            listaLivros.appendChild(li);
        });
    }

    // Função para exibir os livros disponíveis no formulário de aluguel
    function exibirLivrosSelect() {
        selectLivro.innerHTML = ''; // Limpa o select antes de recriá-lo
        livros.forEach(livro => {
            if (livro.quantidade > 0) {
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

        if (!livroSelecionado || livroSelecionado.quantidade <= 0) {
            alert('Livro selecionado não está disponível para aluguel!');
            return;
        }

        // Simulação do processo de aluguel
        alert(Livro "${livroSelecionado.titulo}" alugado por ${nome}, da sala ${sala}!);

        // Atualização da disponibilidade do livro e quantidade
        livroSelecionado.quantidade -= 1;
        if (livroSelecionado.quantidade === 0) {
            livroSelecionado.disponivel = false;
        }

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

        alugueis.push(aluguel);

        // Limpar campos do formulário
        formAluguel.reset();

        // Atualizar interface
        exibirLivros();
        exibirLivrosSelect();
        atualizarTabelaAlugueis();
        
        // Salvar no localStorage
        localStorage.setItem('livros', JSON.stringify(livros));
        localStorage.setItem('alugueis', JSON.stringify(alugueis));
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
            disponivel: quantidadeLivro > 0 // Disponível se a quantidade for maior que 0
        };

        livros.push(novoLivro);
        alert(Livro "${novoLivro.titulo}" adicionado com sucesso!);

        // Limpar campos do formulário
        formAdicionar.reset();

        // Atualizar interface
        exibirLivros();
        exibirLivrosSelect();
        atualizarTabelaAlugueis();

        // Salvar no localStorage
        localStorage.setItem('livros', JSON.stringify(livros));
    });

    formRemover.addEventListener('submit', function(event) {
        event.preventDefault();
        const livroId = parseInt(document.getElementById('livroId').value);
        if (isNaN(livroId)) {
            alert('Digite um ID válido do livro!');
            return;
        }
        const index = livros.findIndex(livro => livro.id === livroId);
        if (index === -1) {
            alert('Livro não encontrado!');
            return;
        }
        const livroRemovido = livros.splice(index, 1)[0];
        alert(Livro "${livroRemovido.titulo}" removido com sucesso!);

        // Atualizar interface
        exibirLivros();
        exibirLivrosSelect();
        atualizarTabelaAlugueis();

        // Salvar no localStorage
        localStorage.setItem('livros', JSON.stringify(livros));
    });

    formDevolucao.addEventListener('submit', function(event) {
        event.preventDefault();
        const codigoDevolucao = parseInt(document.getElementById('codigoDevolucao').value);
        if (isNaN(codigoDevolucao)) {
            alert('Digite um código de devolução válido!');
            return;
        }
        const index = alugueis.findIndex(aluguel => aluguel.codigoDevolucao === codigoDevolucao);
        if (index === -1) {
            alert('Código de devolução não encontrado!');
            return;
        }
        const aluguelDevolvido = alugueis.splice(index, 1)[0];

        // Atualizar a disponibilidade do livro devolvido
        const livroDevolvido = livros.find(livro => livro.titulo === aluguelDevolvido.livro);
        livroDevolvido.quantidade += 1;
        if (livroDevolvido.quantidade > 0) {
            livroDevolvido.disponivel = true;
        }

        alert(Livro "${aluguelDevolvido.livro}" devolvido com sucesso por ${aluguelDevolvido.nome}!);

        // Atualizar interface
        exibirLivros();
        exibirLivrosSelect();
        atualizarTabelaAlugueis();

        // Salvar no localStorage
        localStorage.setItem('livros', JSON.stringify(livros));
        localStorage.setItem('alugueis', JSON.stringify(alugueis));
    });

    // Função para atualizar a tabela de aluguéis
    function atualizarTabelaAlugueis() {
        tabelaAlugueis.innerHTML = ''; // Limpa a tabela antes de recriá-la
        alugueis.forEach(aluguel => {
            const tr = document.createElement('tr');
            tr.innerHTML = 
                <td>${aluguel.livro}</td>
                <td>${aluguel.nome}</td>
                <td>${aluguel.sala}</td>
                <td>${aluguel.dataAluguel}</td>
                <td>${aluguel.dataDevolucao}</td>
                <td>${aluguel.codigoDevolucao}</td>
                <td>${aluguel.status}</td>
            ;
            tabelaAlugueis.appendChild(tr);
        });
    }

    // Exibir inicialmente os livros e a tabela de aluguéis
    exibirLivros();
    exibirLivrosSelect();
    atualizarTabelaAlugueis();
});
