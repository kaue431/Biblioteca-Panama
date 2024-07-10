// Referência ao Firestore (assumindo que o Firebase já está inicializado no HTML)
const db = firebase.firestore();

// Dados iniciais dos livros e aluguéis
let livros = [];
let alugueis = [];

// Função para carregar dados do Firestore
async function carregarDadosFirestore() {
  try {
    const livrosSnapshot = await db.collection('livros').get();
    livros = livrosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const alugueisSnapshot = await db.collection('alugueis').get();
    alugueis = alugueisSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    exibirLivros();
    exibirLivrosSelect();
    atualizarTabelaAlugueis();
  } catch (error) {
    console.error('Erro ao carregar dados do Firestore:', error);
  }
}

// Função para salvar dados no Firestore
async function salvarDadosFirestore() {
  try {
    await db.collection('livros').doc('livrosData').set({ livros });
    await db.collection('alugueis').doc('alugueisData').set({ alugueis });
  } catch (error) {
    console.error('Erro ao salvar dados no Firestore:', error);
  }
}

// Carregar dados do Firestore ao inicializar a página
document.addEventListener('DOMContentLoaded', function() {
  carregarDadosFirestore();
});

// Restante do seu código de gerenciamento de livros e aluguéis...

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
  alert(`Livro "${livroSelecionado.titulo}" alugado por ${nome}, da sala ${sala}!`);

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
  
  // Salvar no Firestore
  salvarDadosFirestore();
});

// Evento de submissão do formulário de acesso restrito
const formAcesso = document.getElementById('form-acesso');
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

// Funções para atualizar a interface com os dados
function exibirLivros() {
  // Lógica para exibir os livros na interface...
}

function exibirLivrosSelect() {
  // Lógica para atualizar o select de livros na interface...
}

function atualizarTabelaAlugueis() {
  // Lógica para atualizar a tabela de aluguéis na interface...
}

// Exibir inicialmente os livros e a tabela de aluguéis ao carregar a página
exibirLivros();
exibirLivrosSelect();
atualizarTabelaAlugueis();
