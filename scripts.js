document.addEventListener('DOMContentLoaded', function() {
    // Inicialização do Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDFVFYGg0rg9P82kw3-PvSFahGJmJXr2bw",
        authDomain: "panama-biblioteca.firebaseapp.com",
        projectId: "panama-biblioteca",
        storageBucket: "panama-biblioteca.appspot.com",
        messagingSenderId: "886950292259",
        appId: "1:886950292259:web:1a7c6ea618c3aa86bf7a96",
        measurementId: "G-4C70YD1KER"
    };
    
    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Função para exibir os livros disponíveis na lista
    function exibirLivros() {
        db.collection("livros").get().then((querySnapshot) => {
            listaLivros.innerHTML = ''; // Limpa a lista antes de recriá-la
            selectLivro.innerHTML = ''; // Limpa o select antes de recriá-lo
            querySnapshot.forEach((doc) => {
                const livro = doc.data();
                const li = document.createElement('li');
                li.textContent = `${livro.titulo} - Quantidade: ${livro.quantidade}`;
                if (!livro.disponivel && livro.quantidade > 0) {
                    li.classList.add('indisponivel');
                }
                listaLivros.appendChild(li);
                
                if (livro.quantidade > 0) {
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = livro.titulo;
                    selectLivro.appendChild(option);
                }
            });
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

        db.collection("livros").doc(livroId).get().then((doc) => {
            if (doc.exists) {
                const livro = doc.data();
                if (livro.quantidade <= 0) {
                    alert('Livro selecionado não está disponível para aluguel!');
                    return;
                }

                alert(`Livro "${livro.titulo}" alugado por ${nome}, da sala ${sala}!`);

                // Atualização da disponibilidade do livro e quantidade
                db.collection("livros").doc(livroId).update({
                    quantidade: firebase.firestore.FieldValue.increment(-1),
                    disponivel: livro.quantidade - 1 > 0
                });

                // Registrar o aluguel na Firestore
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

                db.collection("alugueis").add(aluguel);

                // Limpar campos do formulário
                formAluguel.reset();

                // Atualizar interface
                exibirLivros();
                atualizarTabelaAlugueis();
            } else {
                alert('Livro não encontrado!');
            }
        });
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

        // Adicionar um novo livro no Firestore
        const novoLivro = {
            titulo: tituloLivro,
            genero: generoLivro,
            quantidade: quantidadeLivro,
            disponivel: quantidadeLivro > 0 // Disponível se a quantidade for maior que 0
        };

        db.collection("livros").add(novoLivro).then(() => {
            alert(`Livro "${novoLivro.titulo}" adicionado com sucesso!`);

            // Limpar campos do formulário
            formAdicionar.reset();

            // Atualizar interface
            exibirLivros();
        });
    });

    formRemover.addEventListener('submit', function(event) {
        event.preventDefault();
        const livroId = document.getElementById('livroId').value;

        if (!livroId) {
            alert('Digite um ID válido do livro!');
            return;
        }

        db.collection("livros").doc(livroId).delete().then(() => {
            alert('Livro removido com sucesso!');

            // Atualizar interface
            exibirLivros();
        }).catch((error) => {
            alert('Erro ao remover livro: ' + error.message);
        });
    });

    formDevolucao.addEventListener('submit', function(event) {
        event.preventDefault();
        const codigoDevolucao = parseInt(document.getElementById('codigoDevolucao').value);

        if (isNaN(codigoDevolucao)) {
            alert('Digite um código de devolução válido!');
            return;
        }

        db.collection("alugueis").where("codigoDevolucao", "==", codigoDevolucao).get().then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const aluguel = doc.data();

                db.collection("alugueis").doc(doc.id).delete();

                db.collection("livros").where("titulo", "==", aluguel.livro).get().then((livrosSnapshot) => {
                    if (!livrosSnapshot.empty) {
                        const livroDoc = livrosSnapshot.docs[0];
                        const livro = livroDoc.data();

                        db.collection("livros").doc(livroDoc.id).update({
                            quantidade: firebase.firestore.FieldValue.increment(1),
                            disponivel: true
                        });

                        alert(`Livro "${aluguel.livro}" devolvido com sucesso por ${aluguel.nome}!`);

                        // Atualizar interface
                        exibirLivros();
                        atualizarTabelaAlugueis();
                    }
                });
            } else {
                alert('Código de devolução não encontrado!');
            }
        });
    });

    // Função para atualizar a tabela de aluguéis
    function atualizarTabelaAlugueis() {
        db.collection("alugueis").get().then((querySnapshot) => {
            tabelaAlugueis.innerHTML = ''; // Limpa a tabela antes de recriá-la
            querySnapshot.forEach((doc) => {
                const aluguel = doc.data();
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
        });
    }

    // Exibir inicialmente os livros e a tabela de aluguéis
    exibirLivros();
    atualizarTabelaAlugueis();
});
