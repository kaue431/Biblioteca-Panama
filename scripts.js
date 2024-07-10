document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.firestore();

    // Inicialização dos dados a partir do Firestore e sincronização com LocalStorage
    async function syncDataWithFirestore() {
        const livrosSnapshot = await db.collection('livros').get();
        let livros = [];
        livrosSnapshot.forEach(doc => {
            livros.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('livros', JSON.stringify(livros));
        exibirLivros();
        exibirLivrosSelect();

        const alugueisSnapshot = await db.collection('alugueis').get();
        let alugueis = [];
        alugueisSnapshot.forEach(doc => {
            alugueis.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('alugueis', JSON.stringify(alugueis));
        atualizarTabelaAlugueis();
    }

    let livros = JSON.parse(localStorage.getItem('livros')) || [];
    let alugueis = JSON.parse(localStorage.getItem('alugueis')) || [];

    const listaLivros = document.getElementById('lista-livros');
    const selectLivro = document.getElementById('livro');
    const adminPanel = document.getElementById('admin-panel');
    const formAcesso = document.getElementById('form-acesso');
    const formAdicionar = document.getElementById('form-adicionar');
    const formRemover = document.getElementById('form-remover');
    const formDevolucao = document.getElementById('form-devolucao');
    const tabelaAlugueis = document.getElementById('tabela').getElementsByTagName('tbody')[0];
    const senhaCorreta = 'admin123';

    function exibirLivros() {
        listaLivros.innerHTML = '';
        livros.forEach(livro => {
            const li = document.createElement('li');
            li.textContent = `${livro.titulo} - Quantidade: ${livro.quantidade}`;
            if (!livro.disponivel && livro.quantidade > 0) {
                li.classList.add('indisponivel');
            }
            listaLivros.appendChild(li);
        });
    }

    function exibirLivrosSelect() {
        selectLivro.innerHTML = '';
        livros.forEach(livro => {
            if (livro.quantidade > 0) {
                const option = document.createElement('option');
                option.value = livro.id;
                option.textContent = livro.titulo;
                selectLivro.appendChild(option);
            }
        });
    }

    const formAluguel = document.getElementById('form-aluguel');
    formAluguel.addEventListener('submit', async function(event) {
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
            alert('Livro não disponível para aluguel.');
            return;
        }

        const aluguel = {
            nomeLivro: livroSelecionado.titulo,
            nome,
            sala,
            dataAluguel: new Date().toLocaleDateString(),
            dataDevolucao: '',
            codigoDevolucao: Math.floor(Math.random() * 10000),
            status: 'Alugado'
        };

        alugueis.push(aluguel);
        localStorage.setItem('alugueis', JSON.stringify(alugueis));
        atualizarTabelaAlugueis();

        livroSelecionado.quantidade--;
        localStorage.setItem('livros', JSON.stringify(livros));
        exibirLivros();
        exibirLivrosSelect();

        await db.collection('livros').doc(livroSelecionado.id).update({ quantidade: livroSelecionado.quantidade });
        await db.collection('alugueis').add(aluguel);

        formAluguel.reset();
    });

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

    formAdicionar.addEventListener('submit', async function(event) {
        event.preventDefault();

        const titulo = document.getElementById('tituloLivro').value;
        const genero = document.getElementById('generoLivro').value;
        const quantidade = parseInt(document.getElementById('quantidadeLivro').value);

        if (!titulo || !genero || isNaN(quantidade) || quantidade <= 0) {
            alert('Preencha todos os campos corretamente!');
            return;
        }

        const novoLivro = {
            titulo,
            genero,
            quantidade
        };

        const livroRef = await db.collection('livros').add(novoLivro);
        novoLivro.id = livroRef.id;

        livros.push(novoLivro);
        localStorage.setItem('livros', JSON.stringify(livros));
        exibirLivros();
        exibirLivrosSelect();

        formAdicionar.reset();
    });

    formRemover.addEventListener('submit', async function(event) {
        event.preventDefault();

        const livroId = document.getElementById('livroId').value;

        const livroIndex = livros.findIndex(livro => livro.id === livroId);
        if (livroIndex === -1) {
            alert('Livro não encontrado!');
            return;
        }

        await db.collection('livros').doc(livroId).delete();

        livros.splice(livroIndex, 1);
        localStorage.setItem('livros', JSON.stringify(livros));
        exibirLivros();
        exibirLivrosSelect();

        formRemover.reset();
    });

    formDevolucao.addEventListener('submit', async function(event) {
        event.preventDefault();

        const codigoDevolucao = parseInt(document.getElementById('codigoDevolucao').value);
        const aluguel = alugueis.find(aluguel => aluguel.codigoDevolucao === codigoDevolucao && aluguel.status === 'Alugado');

        if (!aluguel) {
            alert('Código de devolução não encontrado ou livro já devolvido!');
            return;
        }

        aluguel.dataDevolucao = new Date().toLocaleDateString();
        aluguel.status = 'Devolvido';
        localStorage.setItem('alugueis', JSON.stringify(alugueis));
        atualizarTabelaAlugueis();

        const livro = livros.find(livro => livro.titulo === aluguel.nomeLivro);
        livro.quantidade++;
        localStorage.setItem('livros', JSON.stringify(livros));
        exibirLivros();
        exibirLivrosSelect();

        const aluguelRef = await db.collection('alugueis').where('codigoDevolucao', '==', codigoDevolucao).get();
        aluguelRef.forEach(async doc => {
            await db.collection('alugueis').doc(doc.id).update(aluguel);
        });

        await db.collection('livros').doc(livro.id).update({ quantidade: livro.quantidade });

        formDevolucao.reset();
    });

    function atualizarTabelaAlugueis() {
        tabelaAlugueis.innerHTML = '';

        alugueis.forEach(aluguel => {
            const row = tabelaAlugueis.insertRow();
            row.insertCell(0).textContent = aluguel.nomeLivro;
            row.insertCell(1).textContent = aluguel.nome;
            row.insertCell(2).textContent = aluguel.sala;
            row.insertCell(3).textContent = aluguel.dataAluguel;
            row.insertCell(4).textContent = aluguel.dataDevolucao;
            row.insertCell(5).textContent = aluguel.codigoDevolucao;
            row.insertCell(6).textContent = aluguel.status;
        });
    }

    exibirLivros();
    exibirLivrosSelect();
    atualizarTabelaAlugueis();
});
