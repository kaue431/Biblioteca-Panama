
// Referência ao Firestore
const db = firebase.firestore();

// Referências às coleções do Firestore
const livrosCollection = db.collection('livros');
const alugueisCollection = db.collection('alugueis');

const listaLivros = document.getElementById('lista-livros');
const selectLivro = document.getElementById('livro');
const adminPanel = document.getElementById('admin-panel');
const formAcesso = document.getElementById('form-acesso');
const formAdicionar = document.getElementById('form-adicionar');
const formRemover = document.getElementById('form-remover');
const formDevolucao = document.getElementById('form-devolucao');
const tabelaAlugueis = document.getElementById('tabela-corpo');
const senhaCorreta = 'admin123'; // Senha de acesso restrito (simulação)

// Função para exibir os livros disponíveis na lista
function exibirLivros() {
    listaLivros.innerHTML = ''; // Limpa a lista antes de recriá-la
    livrosCollection.get().then(snapshot => {
        snapshot.forEach(doc => {
            const livro = doc.data();
            const li = document.createElement('li');
            li.textContent = `${livro.titulo} - Quantidade: ${livro.quantidade}`;
            if (!livro.disponivel && livro.quantidade > 0) {
                li.classList.add('indisponivel');
            }
            listaLivros.appendChild(li);
        });
    }).catch(error => {
        console.error('Erro ao obter livros: ', error);
    });
}

// Função para exibir os livros disponíveis no formulário de aluguel
function exibirLivrosSelect() {
    selectLivro.innerHTML = ''; // Limpa o select antes de recriá-lo
    livrosCollection.get().then(snapshot => {
        snapshot.forEach(doc => {
            const livro = doc.data();
            if (livro.quantidade > 0) {
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = livro.titulo;
                selectLivro.appendChild(option);
            }
        });
    }).catch(error => {
        console.error('Erro ao obter livros: ', error);
    });
}

// Evento de submissão do formulário de aluguel
const formAluguel = document.getElementById('form-aluguel');
formAluguel.addEventListener('submit', function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const sala = document.getElementById('sala').value;
    const livroId = selectLivro.value;

    if (!nome || !sala || !livroId) {
        alert('Preencha todos os campos!');
        return;
    }

    livrosCollection.doc(livroId).get().then(doc => {
        if (doc.exists) {
            const livro = doc.data();

            if (livro.quantidade > 0) {
                // Simulação do processo de aluguel
                alert(`Livro "${livro.titulo}" alugado por ${nome}, da sala ${sala}!`);

                // Atualização da disponibilidade do livro e quantidade
                livro.quantidade -= 1;
                if (livro.quantidade === 0) {
                    livro.disponivel = false;
                }

                // Registrar o aluguel na coleção de aluguéis
                const dataAluguel = new Date();
                const dataDevolucao = new Date();
                dataDevolucao.setDate(dataDevolucao.getDate() + 7); // Devolução em 7 dias

                const aluguel = {
                    livro: livro.titulo,
                    nome: nome,
                    sala: sala,
                    dataAluguel: dataAluguel.toLocaleDateString(),
                    dataDevolucao: dataDevolucao.toLocaleDateString(),
                    codigoDevolucao: Math.floor(1000 + Math.random() * 9000), // Gerar código de devolução aleatório
                    status: 'Dentro do prazo'
                };

                alugueisCollection.add(aluguel).then(() => {
                    // Atualizar quantidade e disponibilidade do livro
                    livrosCollection.doc(livroId).update({
                        quantidade: livro.quantidade,
                        disponivel: livro.disponivel
                    }).then(() => {
                        // Limpar campos do formulário
                        formAluguel.reset();

                        // Atualizar interface
                        exibirLivros();
                        exibirLivrosSelect();
                        atualizarTabelaAlugueis();
                    }).catch(error => {
                        console.error('Erro ao atualizar livro: ', error);
                    });
                }).catch(error => {
                    console.error('Erro ao adicionar aluguel: ', error);
                });
            } else {
                alert('Livro não disponível para aluguel!');
            }
        } else {
            alert('Livro não encontrado!');
        }
    }).catch(error => {
        console.error('Erro ao buscar livro: ', error);
    });
});

// Evento de submissão do formulário de acesso
formAcesso.addEventListener('submit', function(event) {
    event.preventDefault();

    const senha = document.getElementById('senha').value;

    if (senha === senhaCorreta) {
        adminPanel.style.display = 'block';
    } else {
        alert('Senha incorreta!');
    }
});

// Inicialização da página
exibirLivros();
exibirLivrosSelect();
atualizarTabelaAlugueis();

// Função para atualizar a tabela de aluguéis
function atualizarTabelaAlugueis() {
    tabelaAlugueis.innerHTML = ''; // Limpa a tabela antes de recriá-la

    alugueisCollection.get().then(snapshot => {
        snapshot.forEach(doc => {
            const aluguel = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${aluguel.livro}</td>
                <td>${aluguel.nome}</td>
                <td>${aluguel.sala}</td>
                <td>${aluguel.dataAluguel}</td>
                <td>${aluguel.dataDevolucao}</td>
                <td>${aluguel.codigoDevolucao}</td>
                <td>${aluguel.status}</td>
            `;
            tabelaAlugueis.appendChild(row);
        });
    }).catch(error => {
        console.error('Erro ao obter aluguéis: ', error);
    });
}

// Evento de submissão do formulário de adição de livro
formAdicionar.addEventListener('submit', function(event) {
    event.preventDefault();

    const titulo = document.getElementById('tituloLivro').value;
    const genero = document.getElementById('generoLivro').value;
    const quantidade = parseInt(document.getElementById('quantidadeLivro').value);

    if (!titulo || !genero || isNaN(quantidade)) {
        alert('Preencha todos os campos corretamente!');
        return;
    }

    const novoLivro = {
        titulo: titulo,
        genero: genero,
        quantidade: quantidade,
        disponivel: quantidade > 0
    };

    livrosCollection.add(novoLivro).then(() => {
        // Limpar campos do formulário
        formAdicionar.reset();

        // Atualizar lista de livros
        exibirLivros();
        exibirLivrosSelect();
    }).catch(error => {
        console.error('Erro ao adicionar livro: ', error);
    });
});

// Evento de submissão do formulário de remoção de livro
formRemover.addEventListener('submit', function(event) {
    event.preventDefault();

    const livroId = document.getElementById('livroId').value;

    if (!livroId) {
        alert('Digite o ID do livro a ser removido!');
        return;
    }

    livrosCollection.doc(livroId).delete().then(() => {
        // Limpar campo do formulário
        formRemover.reset();

        // Atualizar lista de livros
        exibirLivros();
        exibirLivrosSelect();
    }).catch(error => {
        console.error('Erro ao remover livro: ', error);
    });
});

// Evento de submissão do formulário de devolução de livro
formDevolucao.addEventListener('submit', function(event) {
    event.preventDefault();

    const codigoDevolucao = parseInt(document.getElementById('codigoDevolucao').value);

    if (!codigoDevolucao) {
        alert('Digite o código de devolução!');
        return;
    }

    alugueisCollection.where('codigoDevolucao', '==', codigoDevolucao).get().then(snapshot => {
        if (snapshot.empty) {
            alert('Código de devolução inválido!');
            return;
        }

        snapshot.forEach(doc => {
            const aluguel = doc.data();
            const livroAlugado = livros.find(livro => livro.titulo === aluguel.livro);

            if (livroAlugado) {
                // Atualizar quantidade e disponibilidade do livro
                livroAlugado.quantidade += 1;
                if (!livroAlugado.disponivel) {
                    livroAlugado.disponivel = true;
                }

                // Remover aluguel da coleção de aluguéis
                alugueisCollection.doc(doc.id).delete().then(() => {
                    // Atualizar livro no Firestore
                    livrosCollection.doc(livroAlugado.id).update({
                        quantidade: livroAlugado.quantidade,
                        disponivel: livroAlugado.disponivel
                    }).then(() => {
                        // Atualizar interface
                        exibirLivros();
                        exibirLivrosSelect();
                        atualizarTabelaAlugueis();

                        alert(`Livro "${aluguel.livro}" devolvido com sucesso!`);
                    }).catch(error => {
                        console.error('Erro ao atualizar livro: ', error);
                    });
                }).catch(error => {
                    console.error('Erro ao remover aluguel: ', error);
                });
            } else {
                alert('Livro não encontrado para devolução!');
            }
        });
    }).catch(error => {
        console.error('Erro ao buscar aluguel: ', error);
    });
});
