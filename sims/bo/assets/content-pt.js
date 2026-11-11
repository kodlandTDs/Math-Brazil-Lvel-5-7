/* ============================================================
   Simulação do Backoffice · Aventuras Matemáticas Níveis 5–7 · PORTUGUÊS
   Traduza apenas o texto entre aspas / crases. Mantenha tags HTML, ids, nomes de arquivos e URLs.
   ============================================================ */
window.CONTENT = { lang: 'pt' };

CONTENT.ui = {
  pageTitle: 'Simulação do Backoffice · Aventuras Matemáticas Nível 5',
  badge: '🧪 SIMULAÇÃO — treinamento Kodland',
  tourBtn: '🚀 Recomeçar o passo a passo',
  courses: 'Courses',
  backCourses: 'Voltar para Courses',
  backAssign: 'Voltar para Assignments',
  viewAssignments: 'Ver os cartões →',
  moreLessons: 'Nesta simulação aparece só a Aula 1. No BO real você vê todas as aulas prontas do curso.',
  stepOf: 'Etapa {n} de {total}', next: 'Avançar →', finish: 'Concluir ✓',
  clickHint: '👆 Clique no item destacado',
  blocked: '👉 Siga a etapa destacada para continuar.',
  toastSim: '🧪 Isto é uma simulação — no BO real, aqui você faria: "{label}".',
  groupRow: 'abrir a agenda da aluna',
  tutorName: 'Tutor Demo',
  nextLesson: 'Aula 2 · amanhã, 15:00',
  groupsNote: 'No Brasil todas as aulas são individuais: cada "grupo" no BO é a agenda de um aluno. O conteúdo das aulas fica sempre em Courses.'
};

CONTENT.lesson = {
  card: `
  <img class="ban" src="media/banner.jpg" alt="">
  <h1>Bem-vindo à aula! 👋</h1>
  <h4>Hoje vamos viver aventuras empolgantes no mundo da geometria. Mas, primeiro, vamos nos conhecer!</h4>
  <div class="mc"><img src="media/tech.jpg" alt=""><div><h3>🎯 Sua missão</h3><ol><li>Ligue o microfone e a câmera.</li><li>Diga seu nome e sua idade.</li><li>Desligue o microfone novamente.</li></ol></div></div>
  <h3>✅ Confira se está tudo certo</h3>
  <ul><li>Consigo ver o tutor;</li><li>Consigo ouvir o tutor;</li><li>Consigo ligar e desligar meu microfone;</li><li>Minha câmera está ligada.</li></ul>
  <div class="spo">Não consigo encontrar o botão para ligar o microfone ou a câmera</div>
  <div class="spo">Não consigo ouvir o tutor. O que devo fazer?</div>
  <div class="spo">O microfone não liga?</div>
  <div class="spo">A câmera não liga?</div>
  <div id="lessonNotes">
    <div class="tn"><div class="l">Teacher notes</div>
      <p><b>Objetivo do cartão:</b> Começar a aula de forma acolhedora e verificar a preparação técnica por meio de etapas observáveis.</p>
      <p><b>O que o tutor deve fazer:</b> Primeiro, ligue seu microfone e sua câmera, cumprimente o aluno e explique a sequência de etapas. Em seguida, escute a apresentação do aluno.</p>
      <p><b>Pontos de atenção:</b> Em caso de problemas técnicos graves, entre em contato com a equipe de suporte técnico.</p></div>
    <details class="slide" open><summary>Slide para o tutor</summary><div><div class="tn"><div class="l">Teacher notes</div>
      <h2>Preparação para a aula: fundamentos do desenho arquitetônico</h2>
      <p>A prefeitura encarregou o escritório de arquitetura de Sophie e Rafi de projetar um pátio escolar moderno. Nesta aula, o aluno aprenderá a reconhecer e diferenciar pontos, segmentos de reta, semirretas e retas, além de nomeá-los com letras do alfabeto latino.</p>
      <details><summary>História que conduz a aula</summary><p>O aluno entra para a equipe como "arquiteto estagiário" e transforma um emaranhado de linhas em uma planta geométrica organizada.</p></details>
      <details><summary>Objetivo principal da aula</summary><p>Distinguir pontos, segmentos de reta, semirretas e retas, nomeá-los com letras do alfabeto latino e interpretar suas representações simbólicas.</p></details>
      <details><summary>Resultados de aprendizagem esperados</summary><p>Diferencia as quatro figuras; lê e escreve A, [AB], [AB e AB; calcula quantos segmentos de reta n pontos formam; sabe qual instrumento usar para cada figura.</p></details>
      <p><b>Papel do tutor:</b> Antes de cada conceito, faça uma pergunta intuitiva com base na história. Não dê a definição imediatamente. Nas atividades interativas, espere o aluno concluir sozinho e peça que mostre o resultado.</p>
      <details><summary>Distribuição do tempo da aula (60 min)</summary><table><tr><th>Etapa</th><th>Duração</th></tr><tr><td>Introdução</td><td>9 min</td></tr><tr><td>Ponto e instrumentos</td><td>6 min</td></tr><tr><td>Ponto, segmento de reta, semirreta e reta</td><td>15 min</td></tr><tr><td>Oficina</td><td>15 min</td></tr><tr><td>Atividade individual</td><td>11 min</td></tr><tr><td>Encerramento</td><td>4 min</td></tr></table></details>
      <details><summary>Abordagem metodológica</summary><p>Intuição → definição formal → prática com a ferramenta interativa. Não altere essa ordem.</p></details>
      <details><summary>Pontos de atenção</summary><p>[AB e [BA são semirretas diferentes; a reta não tem comprimento mensurável; ajude o aluno a entender n·(n−1)/2 sem decorar a fórmula.</p></details>
      <details><summary>Gabarito rápido por cartão (a aula inteira em um só lugar)</summary><p>As respostas de todos os cartões da aula, em ordem.</p></details>
    </div></div></details>
  </div>`
};

CONTENT.steps = [
  { title: '1 · Abra o curso', body: 'O conteúdo das aulas fica sempre em <b>Courses</b> — não em Groups. Clique em <b>[2163] Aventuras Matemáticas Nível 5</b>.' },
  { title: '2 · O cadastro do curso', body: 'Aqui você confere o curso: <b>Business branch: Brazil</b>, <b>Language: Portuguese</b>, <b>40 aulas</b> e <b>5 módulos</b>. O código <b>[2163]</b> é o mesmo que aparece no treinamento.' },
  { title: '3 · Abra Assignments', body: 'Os cartões de cada aula ficam na aba <b>Assignments</b>. Clique nela.' },
  { title: '4 · Escolha a aula', body: 'O campo <b>Lesson</b> escolhe de qual aula você vê os cartões. Aqui está a Aula 1: <b>Ponto, reta, semirreta e segmentos de reta</b>.' },
  { title: '5 · Os cartões da aula', body: '<b>In-class assignments</b> é a lista dos cartões interativos, na ordem da aula. <b>Theory ✓</b> marca cartões feitos juntos e sem nota; <b>Max. score</b> mostra quantos pontos um cartão vale — esses o aluno resolve na própria cópia.' },
  { title: '6 · A lição de casa', body: 'A lição de casa é um cartão separado, em <b>Homework assignments</b>. Na aula, você só mostra onde ela está — não a resolve com o aluno.' },
  { title: '7 · Sem link da Wiki', body: '<b>Study guides</b> está vazio, e está certo assim: nos Níveis 5–7 o roteiro do tutor fica <b>dentro dos cartões</b>, nas <b>Teacher notes</b> e no <b>Slide para o tutor</b>.' },
  { title: '8 · Abra o primeiro cartão', body: 'Clique em <b>Boas-vindas!</b> para ver um cartão por dentro.' },
  { title: '9 · As Teacher notes', body: 'O bloco <b>tracejado amarelo</b> são as <b>Teacher notes</b> do cartão: objetivo, o que fazer e pontos de atenção. Logo abaixo, o <b>Slide para o tutor</b> traz o roteiro completo da aula: história, objetivos, tempo, metodologia, pontos de atenção e gabarito. Leia tudo antes da aula.' },
  { title: '10 · Veja como o aluno vê', body: 'Ative <b>Preview</b> no topo do cartão para ver o cartão com os olhos do aluno.' },
  { title: '11 · O que o aluno vê', body: 'No Preview, as Teacher notes e o Slide para o tutor <b>desaparecem</b>: o aluno vê só o conteúdo do cartão. Por isso você não precisa esconder nada — mas também não leia as notas em voz alta.' }
];

CONTENT.done = {
  title: 'Simulação concluída!',
  body: 'Você abriu o curso pelo código, encontrou os cartões da aula em Assignments, viu a lição de casa e as Teacher notes, e conferiu o que o aluno vê.',
  next: '<b>Próximo passo:</b> volte ao treinamento e continue o módulo.',
  stay: 'Continuar explorando',
  again: '↺ Fazer de novo'
};
