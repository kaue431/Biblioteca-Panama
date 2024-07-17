document.addEventListener('DOMContentLoaded', function() {
    const listaLivros = document.getElementById('lista-livros');
    const selectLivro = document.getElementById('livro');
    const tabelaAlugueis = document.getElementById('tabela').getElementsByTagName('tbody')[0];

    // Função para carregar livros disponíveis do Firestore
    async function carregarLivros() {
        const querySnapshot = await db.collection('livrosDisponiveis').get();
        let livros = [];
        querySnapshot.forEach((doc) => {
            livros.push({ id: doc.id, ...doc.data() });
        });
        return livros;
    }

    // Função para exibir os livros disponíveis
    async function exibirLivros() {
        const livros = await carregarLivros();
        listaLivros.innerHTML = '';
        livros.forEach(livro => {
            const li = document.createElement('li');
            li.textContent = `${livro.titulo} - Quantidade: ${livro.quantidade}`;
            listaLivros.appendChild(li);

            const option = document.createElement('option');
            option.value = livro.id;
            option.textContent = livro.titulo;
            selectLivro.appendChild(option);
        });
    }

    // Função para registrar aluguel no Firestore
    async function registrarAluguel(aluguel) {
        await db.collection('livrosAlugados').add(aluguel);
    }

    // Evento de submissão do formulário de aluguel
    document.getElementById('form-aluguel').addEventListener('submit', async function(event) {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const sala = document.getElementById('sala').value;
        const livroId = selectLivro.value;

        const livroDoc = await db.collection('livrosDisponiveis').doc(livroId).get();
        if (!livroDoc.exists || livroDoc.data().quantidade <= 0) {
            alert('Livro selecionado não está disponível para aluguel!');
            return;
        }

        alert(`Livro "${livroDoc.data().titulo}" alugado por ${nome}, da sala ${sala}!`);

        await db.collection('livrosDisponiveis').doc(livroId).update({
            quantidade: firebase.firestore.FieldValue.increment(-1)
        });

        const dataAluguel = new Date();
        const dataDevolucao = new Date();
        dataDevolucao.setDate(dataDevolucao.getDate() + 7);

        const aluguel = {
            livro: livroDoc.data().titulo,
            nome: nome,
            sala: sala,
            dataAluguel: dataAluguel.toLocaleDateString(),
            dataDevolucao: dataDevolucao.toLocaleDateString(),
            codigoDevolucao: Math.floor(1000 + Math.random() * 9000),
            status: 'Dentro do prazo'
        };

        await registrarAluguel(aluguel);

        // Atualizar interface
        exibirLivros();
    });

    // Função para carregar alugueis do Firestore
    async function carregarAlugueis() {
        const querySnapshot = await db.collection('livrosAlugados').get();
        tabelaAlugueis.innerHTML = '';
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
    }

    // Carregar livros e alugueis na inicialização
    exibirLivros();
    carregarAlugueis();
});
