// Função para exibir os livros disponíveis na lista
function exibirLivros() {
  const listaLivros = document.getElementById('lista-livros');
  listaLivros.innerHTML = ''; // Limpa a lista antes de recriá-la

  // Consultar os documentos da coleção 'livrosDisponiveis'
  getDocs(collection(db, 'livrosDisponiveis')).then(querySnapshot => {
    querySnapshot.forEach(doc => {
      const livro = doc.data();
      const li = document.createElement('li');
      li.textContent = `${livro.titulo} - Quantidade: ${livro.quantidade}`;
      if (!livro.disponivel && livro.quantidade > 0) {
        li.classList.add('indisponivel');
      }
      listaLivros.appendChild(li);
    });
  }).catch(error => {
    console.error('Erro ao obter livros disponíveis: ', error);
  });
}

// Evento de submissão do formulário de aluguel
const formAluguel = document.getElementById('form-aluguel');
formAluguel.addEventListener('submit', function(event) {
  event.preventDefault();

  const nome = document.getElementById('nome').value;
  const sala = document.getElementById('sala').value;
  const livroId = parseInt(document.getElementById('livro').value);

  if (!nome || !sala || isNaN(livroId)) {
    alert('Preencha todos os campos!');
    return;
  }

  // Consultar o documento do livro selecionado
  const livroRef = doc(db, 'livrosDisponiveis', livroId.toString());
  getDoc(livroRef).then(docSnapshot => {
    if (docSnapshot.exists()) {
      const livro = docSnapshot.data();

      if (livro.quantidade > 0) {
        // Realizar o aluguel do livro (atualizar quantidade e adicionar à coleção 'livrosAlugados')
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

        // Atualizar quantidade de livros disponíveis
        const updatedLivro = {
          ...livro,
          quantidade: livro.quantidade - 1,
          disponivel: livro.quantidade - 1 > 0
        };

        // Atualizar livro na coleção 'livrosDisponiveis'
        updateDoc(livroRef, updatedLivro);

        // Adicionar aluguel à coleção 'livrosAlugados'
        addDoc(collection(db, 'livrosAlugados'), aluguel).then(() => {
          alert(`Livro "${livro.titulo}" alugado por ${nome}, da sala ${sala}!`);
          exibirLivros(); // Atualizar interface
        }).catch(error => {
          console.error('Erro ao adicionar aluguel: ', error);
        });
      } else {
        alert('Livro selecionado não está disponível para aluguel!');
      }
    } else {
      alert('Livro selecionado não encontrado!');
    }
  }).catch(error => {
    console.error('Erro ao consultar livro: ', error);
  });

  // Limpar campos do formulário
  formAluguel.reset();
});
