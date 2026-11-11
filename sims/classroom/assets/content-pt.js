/* ============================================================
   Guia da aula no Classroom · Treinamento Aventuras Matemáticas Níveis 5–7
   Aula mostrada no Classroom simulado: Aventuras Matemáticas Nível 5 · Aula 1 (Ponto, reta, semirreta e segmento de reta),
   do primeiro cartão até a Atividade individual.
   Traduza apenas o texto entre aspas / crases. Mantenha tags HTML, ${...}, chaves, ids, nomes de arquivos e URLs.
   ============================================================ */
window.CONTENT = { lang: 'pt' };

/* =========================================================
   TEXTOS DA INTERFACE
   ========================================================= */
CONTENT.ui = {
  title: 'Guia da aula no Classroom · Aventuras Matemáticas',

  headerTitle: 'Aventuras Matemáticas · Nível 5 · Aula 1',
  online: '2 online',
  guideChip: 'Guia da aula',
  leave: 'Sair',

  classroom: 'Classroom',
  assignments: 'Assignments',
  prevTask: 'Cartão anterior',
  nextTask: 'Próximo cartão',
  leadGroup: 'Lead the group',
  endSession: 'Encerrar a aula',

  student: 'Ana',
  tutorInitial: 'T',
  tutorYou: 'Tutor (você)',
  following: 'Seguindo o tutor',

  platformLang: 'PT ˅',
  platformUser: 'Tutor',

  teacherNotes: 'Teacher notes',
  submit: '✔ Enviar',
  choose: 'Escolha…',
  yourAnswer: 'Sua resposta',
  correct: '✔ Correto!',
  wrong: '✖ Incorreto, tente de novo.',
  scoreLabel: '✍️ Atividade individual · verificação automática',
  scoreHint: (done, total) => `Perguntas verificadas: ${done}/${total}. Cada resposta correta vale 1 ponto.`,

  seg: {
    title: '📏 Desenho de segmentos de reta',
    count: n => `Segmentos de reta: ${n}`,
    auto: 'Verificação automática',
    reset: 'Limpar',
    hint: 'Arraste de um ponto até outro (ou clique em dois pontos). Solte quando a linha ficar verde.',
    added: s => `✔ Segmento de reta ${s} desenhado.`,
    dup: s => `${s} já foi desenhado: [AB] e [BA] são o mesmo segmento de reta.`,
    all: '🎉 Você desenhou todos os segmentos de reta possíveis! Agora escreva o número abaixo.'
  },

  coachStep: (n, total) => `Guia da aula · ${n}/${total}`,
  next: 'Avançar →',
  clickHint: '👆 Clique no elemento destacado',
  openSections: (opened, total) => `Abra todas as seções (${opened}/${total})`,
  scrollEndNotes: 'Role até o fim das notas',
  scrollEndCard: 'Role até o fim do cartão',
  checks: {
    seg: 'Desenhe pelo menos um segmento de reta',
    answer: 'Responda a uma pergunta e confira com «Enviar»'
  }
};

/* =========================================================
   TELA DE BOAS-VINDAS
   ========================================================= */
CONTENT.welcome = {
  kicker: 'Aventuras Matemáticas Níveis 5–7 · Treinamento de tutores',
  title: 'Guia da aula no <span>Classroom</span>',
  lead: 'Este guia mostra como uma aula dos Níveis 5–7 aparece no <b>Classroom</b>. Usamos os primeiros cartões de uma aula real — <b>Aventuras Matemáticas Nível 5, Aula 1: Ponto, reta, semirreta e segmento de reta</b> (o escritório de arquitetura de Rafi e Sophie) — e uma aluna, a Ana, que já está na sala.',
  seeTitle: 'O que você vai ver',
  see: [
    'Como uma aula é organizada: uma sequência de <b>cartões interativos</b>, com toda a orientação dentro da própria aula.',
    '<b>O que você vê</b> e <b>o que a Ana vê</b>: as <b>Teacher notes</b> ficam dentro dos cartões e só o tutor pode vê-las.',
    'O <b>Slide para o tutor</b>, no primeiro cartão: objetivos, tempo de cada parte, pontos de atenção, gabarito de todos os cartões e um vídeo-guia.',
    'O botão <b>Lead the group</b>, que faz a aluna acompanhar o cartão que você abre.',
    'A <b>atividade individual</b> com verificação automática, que a aluna resolve na própria cópia.'
  ],
  howTitle: 'Como usar',
  howText: 'Este é um guia, não uma prova: não há decisões erradas nem pontos a perder. Siga as etapas destacadas e clique onde o guia indicar. Você pode repetir quantas vezes quiser.',
  start: 'COMEÇAR O GUIA →'
};

/* =========================================================
   CONTEÚDO DA AULA (Aventuras Matemáticas · Nível 5 — Aula 1, em português)
   ========================================================= */
// Perguntas que valem pontos no cartão avaliado (Atividade individual)
CONTENT.graded = ['sr1-q01', 'sr1-q02', 'sr1-q03', 'sr1-q05', 'sr1-q06', 'sr1-q07'];

CONTENT.activities = ({ P, tnotes, spoiler, media, ul, ol, group, card, pic, quiz, choice, inputEx, segApp, scoreBox }) => [
  /* ---------- 1 ---------- */
  { title:`Boas-vindas!`, html:
    pic(P.banner, `Bem-vindo à aula de geometria`) +
    `<h1>Bem-vindo à aula! 👋</h1>
     <h4>Hoje vamos viver aventuras empolgantes no mundo da geometria. Mas, primeiro, vamos nos conhecer!</h4>` +
    media(P.tech, `<h3>🎯 Sua missão</h3>` + ol([`Ligue o microfone e a câmera.`, `Diga seu nome e sua idade.`, `Desligue o microfone novamente.`]), 'narrow') +
    `<h3>✅ Confira se está tudo certo</h3>` +
    ul([`Consigo ver o tutor;`, `Consigo ouvir o tutor;`, `Consigo ligar e desligar meu microfone;`, `Minha câmera está ligada.`]) +
    spoiler(`Não consigo encontrar o botão para ligar o microfone ou a câmera`, ol([`Olhe para a barra inferior da janela da aula.`, `Encontre os ícones de microfone 🎙️ e câmera 🎥.`, `Clique no ícone correspondente para ligar ou desligar o dispositivo.`])) +
    spoiler(`Não consigo ouvir o tutor. O que devo fazer?`, ol([`Confira o volume do seu computador.`, `Verifique se o alto-falante correto está selecionado nas configurações.`, `Levante a mão ✋ para que o tutor perceba o problema.`])) +
    spoiler(`O microfone não liga?`, ol([`Verifique se o acesso ao microfone está autorizado.`, `Clique na seta ao lado do ícone do microfone e selecione o dispositivo correto.`, `Levante a mão ✋ e aguarde a ajuda do tutor.`])) +
    spoiler(`A câmera não liga?`, ol([`Verifique se o acesso à câmera está autorizado.`, `Feche outros programas que possam estar usando a câmera.`, `Se a câmera ainda não funcionar, continue participando da aula pelo áudio.`])) +
    `<div id="tn-first">` +
    tnotes(`
      <p><strong>Objetivo do cartão:</strong> Começar a aula de forma acolhedora e verificar a preparação técnica por meio de etapas observáveis.</p>
      <p><strong>O que o tutor deve fazer:</strong> Primeiro, ligue seu microfone e sua câmera, cumprimente o aluno e explique a sequência de etapas. Em seguida, escute a apresentação do aluno.</p>
      <p><strong>Pontos de atenção:</strong> Em caso de problemas técnicos graves, entre em contato com a equipe de suporte técnico.</p>`) +
    spoiler(`Slide para o tutor`, tnotes(`
      <h1>Preparação para a aula: fundamentos do desenho arquitetônico</h1>
      <p>A prefeitura encarregou o escritório de arquitetura de Sophie e Rafi de projetar um pátio escolar moderno (com áreas esportivas, espaços de descanso e caminhos verdes). Nesta aula, o aluno aprenderá a reconhecer e diferenciar pontos, segmentos de reta, semirretas e retas, além de nomeá-los com letras do alfabeto latino.</p>
      ${spoiler(`História que conduz a aula`, `<p>O escritório de arquitetura de Sophie e Rafi recebeu a missão de projetar um pátio escolar. O aluno entra para a equipe como "arquiteto estagiário" e aprende a delimitar áreas com segmentos de reta, desenhar pistas de corrida paralelas e direcionar feixes de luz de refletores, transformando um emaranhado de linhas em uma planta geométrica organizada.</p>`)}
      ${spoiler(`Objetivo principal da aula`, `<p>O aluno aprenderá a distinguir pontos, segmentos de reta, semirretas e retas por suas definições, nomeá-los corretamente com letras do alfabeto latino e interpretar suas representações simbólicas.</p>`)}
      ${spoiler(`Resultados de aprendizagem esperados`, ol([`Diferencia pontos, segmentos de reta, semirretas e retas de acordo com suas definições.`, `Lê e escreve as representações geométricas: ponto (A), segmento de reta [AB], semirreta [AB e reta AB.`, `Calcula quantos segmentos de reta ou retas podem ser formados a partir de pontos sobre uma reta.`, `Sabe qual instrumento usar (régua, régua longa, compasso, transferidor ou esquadro) para cada figura.`]))}
      <div class="tn-video"><video src="${P.video}" controls preload="none" title="Vídeo-guia da aula"></video></div>
      <p><strong>Papel do tutor:</strong> Antes de apresentar cada conceito, faça uma pergunta intuitiva com base em um exemplo concreto da história da obra ou do pátio (como uma corda de marcação, um feixe de luz de refletor ou a linha do horizonte). Não dê a definição imediatamente. Nas atividades interativas (marcação de pontos, desenho de segmentos de reta e oficina de geometria), espere que o aluno conclua a tarefa sozinho e peça que mostre o resultado.</p>
      <h3>LEIA OBRIGATORIAMENTE TODAS AS NOTAS DO TUTOR DE CADA SLIDE</h3>
      ${spoiler(`Distribuição do tempo da aula (60 min)`, `<table>
        <tr><th>Etapa</th><th>Conteúdo</th><th>Duração</th></tr>
        <tr><td>Introdução</td><td>Boas-vindas; apresentação de Rafi e Sophie; enquete sobre o humor; história do escritório de arquitetura e objetivos</td><td>9 min</td></tr>
        <tr><td>Parte principal 1 — Ponto e instrumentos</td><td>Escolha de modelos de segmentos de reta; associação de instrumentos</td><td>6 min</td></tr>
        <tr><td>Parte principal 2 — Ponto, segmento de reta, semirreta e reta</td><td>4 definições + marcação de pontos; desenho de segmentos de reta; teste com 5 perguntas; autoverificação</td><td>15 min</td></tr>
        <tr><td>Parte principal 3 — Oficina</td><td>Oficina de geometria (desenho com 5 elementos); atividade extra (escrever o próprio nome com segmentos de reta)</td><td>15 min</td></tr>
        <tr><td>Atividade individual</td><td>Parte 1 (6 perguntas) e questões de raciocínio (4 perguntas)</td><td>11 min</td></tr>
        <tr><td>Encerramento</td><td>Avaliação da aula; humor; lembrete da lição de casa</td><td>4 min</td></tr>
      </table><p><em>Total: 60 min.</em></p>`)}
      ${spoiler(`Abordagem metodológica`, `<p>Apresente cada conceito primeiro com uma pergunta baseada em um exemplo da história da obra ou do pátio (intuição); depois, explique a definição formal e a representação simbólica; por fim, pratique com a ferramenta interativa. Não altere essa ordem.</p>`)}
      ${spoiler(`Pontos de atenção`, ol([`Na notação das semirretas, a ordem das letras é importante: [AB e [BA representam semirretas diferentes; a primeira letra indica sempre o ponto de origem.`, `Uma reta não tem "comprimento mensurável" (é infinita) — essa é uma confusão frequente nas atividades individuais.`, `Nas perguntas sobre quantos segmentos de reta ou retas podem ser formados ao unir n pontos dois a dois, ajude o aluno a compreender o raciocínio de n·(n−1)/2, sem exigir que decore a fórmula.`, `Na oficina de geometria, mostre a dica de "encaixe magnético": quando um novo elemento é colocado perto de um ponto existente, ele se conecta a esse ponto.`, `As perguntas da lição de casa sobre raio, diâmetro e corda tratam de um assunto da próxima aula — explique que são questões de exploração.`]))}
      ${spoiler(`Gabarito rápido por cartão (a aula inteira em um só lugar)`, `
        <h4>1. Boas-vindas (verificação técnica)</h4><p><strong>Missão:</strong> Ligar o microfone e a câmera, dizer nome e idade. <strong>Resposta:</strong> Não há.</p>
        <h4>2–3. Rafi e Sophie · Humor</h4><p>Apresentação dos personagens e escolha livre do humor. <strong>Resposta:</strong> Não há.</p>
        <h4>5. Ponto — aquecimento e instrumentos</h4><p>Segmentos de reta: a corda de marcação esticada e a borda reta da tábua. Instrumentos: Circunferência→Compasso; Segmento de reta→Régua; Reta→Régua longa; Ângulo→Transferidor; Perpendicular→Esquadro.</p>
        <h4>6. Segmento de reta, ponto, reta e semirreta</h4><p>Desenho de segmentos de reta: para n pontos, n·(n−1)/2 segmentos. Teste: 1) a semirreta tem origem; a reta não tem início nem fim · 2) [AB começa em A e passa por B · 3) [AB e [BA são semirretas diferentes · 4) a reta não tem extremidades · 5) o feixe de luz de uma lanterna.</p>
        <h4>9. Atividade individual — Parte 1</h4><p>1) Semirreta · 2) [AB] · 3) Falso · 4) C · 5) 3 · 6) "Um segmento de reta pode ser medido com uma régua" e "Infinitas retas podem passar por um único ponto".</p>
        <h4>10. Questões de raciocínio</h4><p>1) 6 · 2) Semirreta · 3) 10 · 4) 13 cm.</p>`)}
      <p><strong>Encerramento da aula:</strong> Revise brevemente a questão em que o aluno teve mais dificuldade na atividade individual. Depois, encerre a aula com as perguntas de avaliação e humor e relembre a lição de casa.</p>
      <h3>Como próximo passo, leia as notas do tutor presentes em cada atividade da aula.</h3>`)) +
    `</div>`
  },

  /* ---------- 2 ---------- */
  { title:`Bem-vindo à aula!`, html:
    card('green', pic(P.rafiSophie, `Rafi e Sophie`) + `<h2>Prazer em conhecer você!</h2><h4>Estes são Rafi e Sophie. Eles vão nos acompanhar durante as aulas, ajudar a realizar as atividades e explorar o mundo da geometria com a gente. Aos poucos, vamos conhecê-los melhor!</h4>`)
  },

  /* ---------- 3 ---------- */
  { title:`Atividade de apresentação`, html:
    card('blue', `<h2>👋 Prazer em conhecer você!</h2><p>Antes de começarmos, conte para Sophie e Rafi como você está se sentindo hoje.</p>` + pic(P.mood, `Escolha como você está se sentindo`)) +
    quiz('l1-mood', `Como você está se sentindo hoje?`, [`😄 Estou muito animado!`, `🙂 Estou bem e pronto para aprender!`, `😴 Estou com um pouquinho de sono.`, `🤔 Estou curioso para saber o que vamos aprender hoje!`], [0, 1, 2, 3]) +
    `<div id="tn-c2">` +
    tnotes(`
      <p><strong>Duração:</strong> 1 a 2 minutos.</p>
      <p><strong>Objetivo do cartão:</strong> Estabelecer uma primeira conexão emocional com o aluno. A pergunta não tem resposta certa ou errada; todas as opções são igualmente válidas.</p>
      <p><strong>O que o tutor deve fazer:</strong> Cumprimente o aluno, peça que escolha uma das opções e faça um breve comentário acolhedor sobre sua escolha.</p>`) +
    `</div>`
  },

  /* ---------- 4 ---------- */
  { title:`Escritório de arquitetura`, html:
    pic(P.plan, `Planta do futuro pátio escolar`) +
    `<h1>Olá, futuro arquiteto! 🏛️</h1>
     <blockquote><p><em>A prefeitura deu uma missão muito importante ao nosso escritório: projetar um pátio escolar moderno. O espaço terá áreas esportivas, cantinhos para descansar e caminhos cercados de áreas verdes. Mas nenhuma construção pode começar sem uma planta detalhada! Hoje, vamos descobrir todos os segredos dos desenhos arquitetônicos. Vamos aprender a usar as linhas a nosso favor!</em></p></blockquote>` +
    tnotes(`
      <p><strong>Duração:</strong> 2 minutos.</p>
      <p><strong>Objetivo do cartão:</strong> Introduzir a história e apresentar ao aluno seu papel como assistente do arquiteto-chefe.</p>
      <p><strong>O que o tutor deve fazer:</strong> Leia o texto em voz alta, com entusiasmo e entonação, e mostre a imagem do espaço ao aluno.</p>`) +
    `<h1>Missão da aula 🎯</h1>
     <p>Transformar um emaranhado de linhas em uma planta geométrica organizada: delimitar os espaços usando segmentos de reta, desenhar pistas de corrida paralelas e direcionar os feixes de luz dos refletores.</p>
     <h3>Nesta semana, você vai aprender a:</h3>` +
    ul([`desenhar e diferenciar pontos, segmentos de reta, semirretas e retas;`, `nomeá-los usando letras do alfabeto latino;`, `dividir circunferências em partes!`]) +
    `<h3>⚡ Tudo pronto? Então vamos começar!</h3>`
  },

  /* ---------- 5 ---------- */
  { title:`Pontos`, html:
    pic(P.warmup, `Encontre o segmento de reta`, '80%') +
    `<h1>Que tal um aquecimento antes de começar? 🔍</h1>
     <h3>Observe os 4 objetos do canteiro de obras. Quais deles representam segmentos de reta?</h3>` +
    quiz('l1-warmup', `Selecione os objetos que representam segmentos de reta.`, [`Uma corda de marcação esticada entre duas estacas`, `Um caminho cheio de curvas no parque`, `A borda reta de uma tábua de madeira`, `A fumaça saindo da chaminé do barracão de obras`], [0, 2], true) +
    tnotes(`
      <p><strong>Duração:</strong> 2 minutos.</p>
      <p><strong>Objetivo do cartão:</strong> Chamar a atenção do aluno antes de começar a teoria e estimular sua percepção intuitiva sobre linhas retas.</p>
      <p><strong>O que o tutor deve fazer:</strong> Deixe que o aluno escolha as respostas sozinho. Não dê dicas antes de conferir as respostas.</p>
      <p><strong>Pontos de atenção:</strong> As respostas corretas são a corda e a borda da tábua. Ambas são retas e estão limitadas por dois pontos.</p>`) +
    pic(P.toolbox, `Kit de ferramentas do arquiteto`, '35%') +
    `<h1>Confira seu kit de ferramentas ✅</h1><h3>Associe cada figura geométrica à ferramenta necessária para desenhá-la.</h3>` +
    group([[`Circunferência`, `Compasso`], [`Segmento de reta`, `Régua`], [`Reta (linha longa)`, `Régua longa`], [`Ângulo`, `Transferidor`], [`Reta perpendicular`, `Esquadro`]]) +
    tnotes(`
      <p><strong>Duração:</strong> 3 minutos.</p>
      <p><strong>Objetivo do cartão:</strong> Reforçar a associação entre conceitos geométricos e ferramentas antes de começar a teoria.</p>
      <p><strong>O que o tutor deve fazer:</strong> Deixe que o aluno faça as associações sozinho. O transferidor e o esquadro serão utilizados mais adiante; não é necessário explicá-los detalhadamente agora.</p>`)
  },

  /* ---------- 6 ---------- */
  { title:`Segmento de reta`, html:
    pic(P.intuition, `Parede, limite do terreno e feixe de luz do refletor`, '85%') +
    `<h1>Como você representaria isso em um desenho? 🤔</h1>
     <blockquote><p><em>Rafi: «Olha só! Aqui temos a parede de um prédio, ali temos o limite de um terreno que se estende infinitamente e, aqui, o feixe de luz de um refletor. Todos parecem linhas, mas são muito diferentes! Como um arquiteto pode representar cada um deles corretamente em um desenho?»</em></p></blockquote>
     <h1>O alfabeto do desenho geométrico 📐</h1>
     <div class="example"><h3>🎓 Ponto</h3><p>Indica uma posição exata no desenho. É representado por uma letra maiúscula do alfabeto latino, como A.</p></div>
     <div class="example"><h3>🎓 Segmento de reta</h3><p>É uma parte da reta limitada por dois pontos. Possui um comprimento definido. É representado entre colchetes: [AB].</p></div>
     <h4>Desenhe o maior número possível de segmentos de reta entre os pontos apresentados. Quantos segmentos de reta você conseguiu desenhar?</h4>
     <p class="sim-note">Na aula real, o aluno usa uma régua que fica verde quando está alinhada com dois pontos. Nesta simulação: arraste de um ponto até outro (ou clique em dois pontos).</p>` +
    segApp() +
    `<p>Quantos segmentos de reta você conseguiu desenhar?</p>` + inputEx('seg-count', '15') +
    `<div class="example"><h3>🎓 Reta</h3><p>Uma linha que não possui início nem fim é chamada de reta. Ela se estende infinitamente nas duas direções. É representada por AB.</p></div>
     <div class="example"><h3>🎓 Semirreta</h3><p>Uma linha que começa em um ponto, mas não possui fim, é chamada de semirreta. O ponto de origem deve ser sempre escrito primeiro! É representada por [AB.</p></div>
     <h2>Descubra a diferença entre semirreta e reta 🔍</h2>` +
    quiz('l1-t1', `1. Qual é a diferença entre uma semirreta e uma reta?`, [`A semirreta é mais curta que a reta`, `A semirreta possui um ponto de origem, enquanto a reta não possui início nem fim`, `A semirreta é sempre uma linha reta, enquanto a reta não é`, `Não existe diferença, são a mesma figura`], [1]) +
    quiz('l1-t2', `2. Observe a representação [AB. Como podemos interpretá-la corretamente?`, [`Semirreta com origem no ponto B e que passa pelo ponto A`, `Semirreta com origem no ponto A e que passa pelo ponto B`, `Segmento de reta entre os pontos A e B`, `Reta que passa pelos pontos A e B`], [1]) +
    quiz('l1-t3', `3. As semirretas [AB e [BA:`, [`São a mesma figura, apenas representadas de maneiras diferentes`, `São duas semirretas diferentes que se estendem em direções opostas`, `Não são semirretas, são retas`, `Esse tipo de representação não existe`], [1]) +
    `<h3>✅ Confira o que você aprendeu</h3>` +
    ul([`um segmento de reta possui duas extremidades;`, `uma semirreta possui um ponto de origem, mas não possui fim;`, `uma reta não possui início nem fim;`, `a primeira letra na representação de uma semirreta indica seu ponto de origem.`])
  },

  /* ---------- 7 (avaliado) ---------- */
  { title:`✍️ Atividade Individual!`, html:
    card('blue', pic(P.practice, ``) + `<h2>Vamos praticar!</h2><p>Esta é uma atividade individual. Lembre-se de tudo o que você aprendeu durante a aula. Boa sorte!</p>`) +
    `<h1>Atividade individual, parte 1: Ponto, segmento de reta, semirreta e reta</h1>` +
    quiz('sr1-q01', `Qual é o nome da figura que começa em um ponto, mas não tem fim?`, [`Segmento de reta`, `Semirreta`, `Reta`, `Ponto`], [1]) +
    quiz('sr1-q02', `Os pontos A e B estão marcados em uma reta. Qual representação indica o segmento de reta entre eles?`, [`AB`, `[AB`, `[AB]`], [2]) +
    quiz('sr1-q03', `A afirmação "Uma reta tem início, mas não tem fim" é verdadeira?`, [`Verdadeiro`, `Falso`], [1]) +
    quiz('sr1-q05', `Em qual ponto a semirreta [CD tem origem?`, [`C`, `D`, `A semirreta não possui ponto de origem`], [0]) +
    `<p><strong>Três pontos, K, L e M, estão marcados em uma reta. Quantos segmentos de reta diferentes você pode desenhar conectando esses pontos dois a dois?</strong></p>` +
    inputEx('sr1-q06', '3') +
    quiz('sr1-q07', `Selecione todas as afirmações VERDADEIRAS.`, [`Um segmento de reta pode ser medido com uma régua.`, `Uma reta possui um comprimento que pode ser medido.`, `Infinitas retas podem passar por um único ponto.`, `[AB e [BA representam a mesma semirreta.`], [0, 2], true) +
    scoreBox() +
    `<div id="tn-seg">` +
    tnotes(`
      <p>✍️ <strong>Atividade individual · avaliada · verificação automática.</strong> <strong>Duração:</strong> 11 minutos (parte 1 + questões de raciocínio).</p>
      <p><strong>O que o tutor deve fazer:</strong> O aluno responde sozinho, na própria cópia do cartão. Não dê dicas antes da primeira tentativa. Se o aluno errar, leve-o de volta ao cartão de teoria (Segmento de reta) em vez de dizer a resposta.</p>
      <p><strong>Gabarito:</strong> 1) Semirreta · 2) [AB] · 3) Falso · 4) C · 5) 3 · 6) a primeira e a terceira afirmações.</p>`) +
    `</div>`
  }
];

/* =========================================================
   ETAPAS DO GUIA
   ========================================================= */
CONTENT.guide = [
  { title: 'Bem-vindo ao Classroom', next: true,
    text: 'Nos Níveis 5–7, tudo o que você precisa para conduzir a aula está no Classroom, <b>dentro da própria aula</b>: os cartões interativos e as orientações para o tutor.<br><br>Neste guia usamos os primeiros cartões de uma aula real: <b>Aventuras Matemáticas Nível 5, Aula 1</b>. Vamos abrir os cartões.' },
  { title: 'Abra os materiais da aula', target: '.tb-group', accept: ['openTasks', 'toggleDropdown'],
    text: 'Os materiais da aula ficam em <b>Assignments</b>. Clique no botão <b>Assignments</b> — ele fica azul quando você passa o mouse.' },
  { title: 'Escolha o primeiro cartão', target: '#dd-0', accept: ['pickActivity:0'],
    text: 'Esta é a lista dos <b>cartões</b> (assignments) da aula, na ordem em que acontecem. É a primeira aula do Nível 5: o escritório de arquitetura de Rafi e Sophie vai projetar um <b>pátio escolar</b>.<br><br>Clique no primeiro: <b>«Boas-vindas!»</b>.' },
  { title: 'Duas visões do mesmo cartão', next: true, wide: true,
    text: 'Antes de continuar, é importante entender <b>o que você vê</b> e <b>o que a Ana vê</b>. Vocês estão no mesmo cartão, mas não na mesma tela:' +
      `<div class="views">
        <div class="view"><div class="vh">👩‍🏫 O que <b>você</b> vê</div>
          <div class="mock"><div class="mk-c">Conteúdo do cartão</div><div class="m-tn">Teacher notes<small>só você vê</small></div></div></div>
        <div class="view"><div class="vh">🧒 O que a <b>Ana</b> vê</div>
          <div class="mock"><div class="mk-c">Conteúdo do cartão</div></div></div>
      </div>` +
      '<ul class="c-list"><li>As <b>Teacher notes</b> aparecem num bloco com <b>borda tracejada laranja</b> dentro do cartão. Só o tutor vê esse bloco — a Ana <b>nunca</b> o vê. Não leia as notas em voz alta.</li><li>No primeiro cartão há também o <b>Slide para o tutor</b>: o roteiro completo da aula.</li><li>Cada cartão tem as próprias notas: é o primeiro lugar para olhar antes e durante cada cartão.</li></ul>' },
  { title: 'O que a Ana vê', target: '#taskScroll', side: true, read: {},
    text: 'A maior parte do cartão é o que a Ana vê: a imagem do parque, a missão (ligar microfone e câmera, dizer nome e idade) e a lista para conferir se está tudo certo, com ajuda para problemas de microfone e câmera.<br><br>Role <b>todo o cartão</b> até o fim. Embaixo há uma parte que só você vê.' },
  { title: 'Teacher notes e Slide para o tutor', target: '#taskScroll', side: true, read: { scope: '#tn-first' }, scrollTo: 'tn-first',
    text: 'O bloco <b>Teacher notes</b> traz as notas curtas deste cartão: objetivo, o que fazer e pontos de atenção.<br><br>O <b>Slide para o tutor</b> é o roteiro mais completo da aula: história, objetivo principal, resultados esperados, <b>vídeo-guia</b>, seu papel, a <b>distribuição do tempo</b> (60 min), a abordagem metodológica, os <b>pontos de atenção</b> e o <b>gabarito de todos os cartões</b>.<br><br>Assista ao vídeo quando estiver preparando a aula.<br><br>Para continuar, <b>abra todas as seções</b> e <b>role até o fim das notas</b>.' },
  { title: 'Ative o Lead the group', target: '#leadToggle', accept: ['toggleLead'],
    text: 'Agora ative o botão <b>Lead the group</b>. Só você tem esse botão — o aluno não.' +
      `<div class="lead-demo">
        <div><span class="ld-sw"></span><b>DESATIVADO</b> — Mesmo que você mude de cartão ou role a página, a Ana fica onde está. Ela pode estar olhando outra coisa.</div>
        <div><span class="ld-sw on"></span><b>ATIVADO</b> — A Ana vê o mesmo cartão que você abre e acompanha a sua rolagem.</div>
      </div>` +
      'Clique no botão — ele fica azul quando está ativado.' },
  { title: 'A Ana está seguindo você', target: '.vt.student', next: true,
    text: '<b>Lead the group</b> ativado ✅ Olhe a imagem da Ana: agora aparece <b>Seguindo o tutor</b>.<br><br>A partir de agora:<ul class="c-list"><li>A Ana vê o <b>mesmo cartão</b> que você e a mesma posição de rolagem (sem as Teacher notes).</li><li>Ela pode clicar em <b>Work independently</b> para explorar sozinha. Nesse caso, vê um aviso e o botão <b>Return</b>.</li></ul>' },
  { title: 'Próximo cartão', target: '#btnNext', accept: ['nextTask'],
    text: 'A seta para a direita leva ao <b>próximo cartão</b>. Como o Lead the group está ativado, a Ana passa junto com você. Clique.' },
  { title: 'Um cartão só para o aluno', target: '#taskScroll', side: true, read: {},
    text: 'Este cartão apresenta Rafi e Sophie. Ele <b>não tem Teacher notes</b>: nem todo cartão precisa de orientação, e tudo bem.<br><br>Leia o cartão com a Ana e role até o fim.' },
  { title: 'Continue', target: '#btnNext', accept: ['nextTask'],
    text: 'Clique em <b>Próximo cartão</b> para seguir.' },
  { title: 'As notas de cada cartão', target: '#taskScroll', side: true, read: { scope: '#tn-c2' },
    text: 'Este cartão é a enquete do humor: todas as respostas estão certas e não há pontuação.<br><br>Embaixo está o bloco <b>Teacher notes</b> deste cartão, sempre no mesmo formato: <b>Duração</b> · <b>Objetivo do cartão</b> · <b>O que o tutor deve fazer</b> · e, às vezes, <b>Pontos de atenção</b>.<br><br>Role até o fim das notas.' },
  { title: 'Abra a lista de cartões', target: '#btnList', accept: ['toggleDropdown'],
    text: 'Agora vamos para a <b>atividade individual</b>. Você não precisa passar cartão por cartão: pela lista, você vai direto ao cartão que quiser.<br><br>Clique no <b>ícone de lista</b> ao lado de <b>Assignments</b>.' },
  { title: 'Escolha a atividade individual', target: '#dd-6', accept: ['pickActivity:6'],
    text: 'Clique em <b>«✍️ Atividade Individual!»</b>. O Lead the group está ativado: a Ana também vai para esse cartão.' },
  { title: 'Cartões com verificação automática', target: '#taskScroll', side: true, read: {}, checks: ['answer'],
    text: 'Este é um <b>cartão avaliado</b>: as respostas são <b>verificadas automaticamente</b> e cada resposta certa vale pontos.<br><br><b>Importante:</b> a Ana responde <b>na própria cópia</b> do cartão, sozinha. O sistema verifica e registra a pontuação dela. Se o cartão for resolvido só na <b>sua</b> tela, a pontuação da Ana fica <b>0</b>.<br><br>Experimente: responda a uma pergunta e confira com «Enviar». Depois, role até o fim do cartão.' },
  { title: 'As notas do cartão avaliado', target: '#taskScroll', side: true, read: { scope: '#tn-seg' }, last: true, btn: 'Concluir ✓',
    text: 'As notas dos cartões avaliados dizem o tempo, o que fazer e o <b>gabarito</b>.<br><br>Nestes cartões:<ul class="c-list"><li><b>Não dê dicas</b> nem a resposta antes da primeira tentativa.</li><li>Se a Ana errar, leve-a de volta ao <b>cartão de teoria</b> (aqui: «Segmento de reta»).</li><li>Confira se ela respondeu <b>na própria cópia</b>.</li></ul>Role até o fim das notas. Isso é o que você precisa saber sobre o formato da aula!' }
];

/* =========================================================
   TELA FINAL
   ========================================================= */
CONTENT.finish = {
  kicker: 'Guia concluído',
  title: '🎓 É assim que uma aula dos Níveis 5–7 funciona no Classroom',
  intro: 'Você viu como uma aula aparece no Classroom e como conduzir o aluno:',
  steps: [
    'A aula é uma sequência de <b>cartões</b> em <b>Assignments</b>: toda a orientação está dentro da aula.',
    'As <b>Teacher notes</b> ficam no bloco tracejado de cada cartão e só <b>você</b> as vê. O aluno nunca as vê.',
    'O <b>Slide para o tutor</b>, no primeiro cartão, é o roteiro completo: objetivos, tempo, pontos de atenção, gabarito e vídeo-guia.',
    'O <b>Lead the group</b> faz o aluno acompanhar o cartão que você abre e a sua rolagem.',
    '✍️ Os <b>cartões avaliados</b> são resolvidos pelo aluno na própria cópia, com verificação automática. Se forem resolvidos só na sua tela, a pontuação do aluno é 0.'
  ],
  tip: '<b>Dica:</b> <b>antes</b> de dar a aula, leia as Teacher notes de todos os cartões e assista ao vídeo-guia do Slide para o tutor.',
  doneLabel: '✅ Simulação concluída',
  doneHint: 'O treinamento já foi avisado: você pode voltar para lá. Se quiser, continue explorando o Classroom livremente.',
  again: '↺ Começar de novo',
  explore: 'Explorar o Classroom'
};
