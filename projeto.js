const fs = require('fs');

// Definição dos registradores
let ACC = 0; // Registrador acumulador
let BNK = 0; // Registrador de backup
let IPT = 0; // Registrador ponteiro de instrução
let NIL = 0; // Registrador nulo

// Tabela de rótulos
const labels = {};

// Enumeração de erros
const Errors = {
  INVALID_INSTRUCTION: 'INVALID_INSTRUCTION',
  LABEL_NOT_FOUND: 'LABEL_NOT_FOUND',
  EMPTY_FILE: 'EMPTY_FILE',
};

// Função para executar as instruções
// Função para executar as instruções
function executeInstruction(instruction) {
  const parts = instruction.split(' ');

  const opcode = parts[0].toUpperCase();
  const operand = parts[1] || null;

  switch (opcode) {
    case 'NOP':
      break;

    case 'MOV':
      if (operand === 'ACC') {
        ACC = parseInt(parts[2]);
      } else if (operand === 'NIL') {
        NIL = parseInt(parts[2]);
      } else if (operand === 'IPT' && parts[2] && !isNaN(parseInt(parts[2]))) {
        IPT = parseInt(parts[2]);
      } else {
        console.log(`Erro: Operando inválido na instrução: ${instruction}`);
        return;
      }
      break;

    case 'SAV':
      BNK = ACC; // Salva o valor do acumulador no registrador de backup
      break;

    case 'SWP':
      [ACC, BNK] = [BNK, ACC]; // Troca os valores do acumulador e do registrador de backup
      break;

    case 'NEG':
      ACC = -ACC; // Inverte o sinal do acumulador
      break;

    case 'ADD':
      ACC += parseInt(parts[1]); // Soma o operando ao acumulador
      break;

    case 'SUB':
      ACC -= parseInt(parts[1]); // Subtrai o operando do acumulador
      break;

    case 'PNT':
      if (operand !== null) {// Verifica se a instrução possui um operando
        console.log(`Erro: A instrução PNT não deve ter um operando: ${instruction}`);
        return;
      }
      console.log(ACC); // Imprime o valor do acumulador
      break;

    case 'JMP':
      if (!labels.hasOwnProperty(operand)) {// Verifica se o rótulo existe
        console.log(`Erro: Rótulo não encontrado: ${operand}`);
        return;
      }
      IPT = labels[operand] - 1; // Define o IPT para o índice do rótulo
      break;

    case 'JEQ':
      if (ACC === 0) {
        if (!labels.hasOwnProperty(operand)) {// Verifica se o rótulo existe
          console.log(`Erro: Rótulo não encontrado: ${operand}`);
          return;
        }
        IPT = labels[operand] - 1; // Define o IPT para o índice do rótulo
      }
      break;

    case 'JNZ':
      if (ACC !== 0) {// Verifica se o rótulo existe
        if (!labels.hasOwnProperty(operand)) {
          console.log(`Erro: Rótulo não encontrado: ${operand}`);
          return;
        }
        IPT = labels[operand] - 1; // Define o IPT para o índice do rótulo
      }
      break;

    case 'JGZ':
      if (ACC > 0) {
        if (!labels.hasOwnProperty(operand)) {// Verifica se o rótulo existe
          console.log(`Erro: Rótulo não encontrado: ${operand}`);
          return;
        }
        IPT = labels[operand] - 1; // Define o IPT para o índice do rótulo
      }
      break;

    case 'JLZ':
      if (ACC < 0) {
        if (!labels.hasOwnProperty(operand)) {// Verifica se o rótulo existe
          console.log(`Erro: Rótulo não encontrado: ${operand}`);
          return;
        }
        IPT = labels[operand] - 1; // Define o IPT para o índice do rótulo
      }
      break;

    default:
      console.log(`Erro: Instrução inválida: ${instruction}`);
      return;
  }
}



// Função para realizar a análise do arquivo e validação de sintaxe
function parseAndValidateIDPFile(filename) {
  const program = fs.readFileSync(filename, 'utf8').split('\n');

  // Verifica se o arquivo está vazio
  if (program.length === 0) {
    console.log('Erro: O arquivo está vazio.');
    return;
  }

  // Verifica a quantidade máxima de instruções
  if (program.length > 32) {
    console.log('Erro: O programa excede o limite máximo de 32 instruções.');
    return;
  }

  // Realiza a análise do arquivo e armazena os rótulos
  for (let i = 0; i < program.length; i++) {
    const instruction = program[i].trim();

    // Ignora linhas em branco
    if (instruction.length === 0) {
      continue;
    }

    // Verifica se a instrução possui um rótulo
    if (instruction.endsWith(':')) {
      const label = instruction.slice(0, -1).trim();

      // Verifica a validade do rótulo
      if (!label.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        console.log(`Erro: Rótulo inválido na linha ${i + 1}: ${label}`);
        return;
      }

      // Verifica se o rótulo já foi definido anteriormente
      if (labels.hasOwnProperty(label)) {
        console.log(`Erro: Rótulo duplicado na linha ${i + 1}: ${label}`);
        return;
      }

      // Armazena o rótulo e o índice da instrução
      labels[label] = i;
    }
  }

  // Executa o programa
  for (IPT = 0; IPT < program.length; IPT++) {
    const instruction = program[IPT].trim();

    // Ignora linhas em branco e rótulos
    if (instruction.length === 0 || instruction.endsWith(':')) {
      continue;
    }

    executeInstruction(instruction); 
  }
}

// Execução do programa principal
const filename = 'prog-errado-05.idp'; // Nome do arquivo .idp contendo o programa
parseAndValidateIDPFile(filename);
