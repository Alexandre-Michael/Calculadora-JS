const display = document.querySelector('.display');

const MAX_LENGTH = 13;
let valorAnterior = null;
let operacaoAtual = null;
let novaEntrada = true; // controla se o próximo caractere deve limpar o display

function adicionarCaracter(caracter) {
    const operadores = ['+', '-', '*', '/', '%'];

    // Limita o tamanho do display para números (não limita operadores)
    if (!operadores.includes(caracter) && display.value.length >= MAX_LENGTH && !novaEntrada) {
        return; // não deixa digitar mais que MAX_LENGTH caracteres
    }

    // Se estiver numa nova entrada e for número ou ponto, limpa o display antes de adicionar
    if (novaEntrada && !operadores.includes(caracter)) {
        display.value = '';
        novaEntrada = false;
    }

    // Se o display estiver com erro ou resultado inválido, limpa antes
    if (
        ['Erro', 'Infinity', '-Infinity', 'NaN', 'Valor inválido'].includes(display.value)
    ) {
        display.value = '';
    }

    if (operadores.includes(caracter)) {
        if (display.value === '' && caracter !== '-') {
            // não aceita operador sem número, exceto '-'
            return;
        }

        if (valorAnterior !== null && operacaoAtual !== null && !novaEntrada) {
            calcular();
        } else {
            valorAnterior = display.value;
        }

        operacaoAtual = caracter;
        novaEntrada = true;
    } else {
        if (display.value === '0' && caracter !== '.') {
            display.value = caracter;
        } else {
            display.value += caracter;
        }
        novaEntrada = false;
    }
}

function limparTela() {
    display.value = '';
    valorAnterior = null;
    operacaoAtual = null;
    novaEntrada = true;
}

function inverterSinal() {
    const valor = parseFloat(display.value);
    if (!isNaN(valor)) {
        display.value = (valor * -1).toString();
    } else {
        display.value = 'Valor inválido';
    }
}

function validarExpressao(expressao) {
    if (/[^0-9+\-*/().% ]/.test(expressao)) return false;
    if (/[+\-*/%]{2,}/.test(expressao.replace(/^\-/, ''))) return false;

    let aberto = 0;
    for (let char of expressao) {
        if (char === '(') aberto++;
        else if (char === ')') aberto--;
        if (aberto < 0) return false;
    }
    if (aberto !== 0) return false;

    if (/\.\./.test(expressao)) return false;
    if (/[+\-*/%]\./.test(expressao)) return false;
    if (/\.([+\-*/%)]|$)/.test(expressao)) return false;

    const tokens = expressao.split(/[^0-9.]+/);
    for (let token of tokens) {
        if (/^0[0-9]+/.test(token)) return false;
    }

    return true;
}

function formatarResultado(numero, maxLength = MAX_LENGTH) {
    let str = numero.toString();

    if (str.length <= maxLength) {
        return str;
    }

    for (let precisao = maxLength - 6; precisao >= 0; precisao--) {
        str = numero.toExponential(precisao);
        if (str.length <= maxLength) {
            return str;
        }
    }

    return str.slice(0, maxLength);
}

function calcular() {
    if (valorAnterior === null || operacaoAtual === null) {
        return;
    }

    const valorAtual = display.value;
    let resultado;

    try {
        const numAnterior = parseFloat(valorAnterior);
        const numAtual = parseFloat(valorAtual);

        if (isNaN(numAnterior) || isNaN(numAtual)) {
            display.value = 'Erro';
            valorAnterior = null;
            operacaoAtual = null;
            novaEntrada = true;
            return;
        }

        switch (operacaoAtual) {
            case '+':
                resultado = numAnterior + numAtual;
                break;
            case '-':
                resultado = numAnterior - numAtual;
                break;
            case '*':
                resultado = numAnterior * numAtual;
                break;
            case '/':
                if (numAtual === 0) {
                    display.value = 'Erro';
                    valorAnterior = null;
                    operacaoAtual = null;
                    novaEntrada = true;
                    return;
                }
                resultado = numAnterior / numAtual;
                break;
            case '%':
                resultado = (numAnterior * numAtual) / 100;
                break;
            default:
                return;
        }
    } catch {
        display.value = 'Erro';
        valorAnterior = null;
        operacaoAtual = null;
        novaEntrada = true;
        return;
    }

    if (!Number.isFinite(resultado)) {
        display.value = 'Erro';
    } else {
        display.value = formatarResultado(resultado, MAX_LENGTH);
    }

    valorAnterior = null;
    operacaoAtual = null;
    novaEntrada = true;
}

document.addEventListener('keydown', (e) => {
    const permitidos = '0123456789+-*/().%';

    if (permitidos.includes(e.key)) {
        e.preventDefault();

        if (!['+', '-', '*', '/', '%'].includes(e.key) && display.value.length >= MAX_LENGTH && !novaEntrada) {
            return;
        }

        adicionarCaracter(e.key);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        calcular();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        display.value = display.value.slice(0, -1);
    } else if (e.key === 'Escape') {
        e.preventDefault();
        limparTela();
    } else {
        e.preventDefault();
    }
});

display.addEventListener('paste', (e) => {
    const texto = (e.clipboardData || window.clipboardData).getData('text');
    if (/[^0-9+\-*/().% ]/.test(texto)) {
        e.preventDefault();
        alert("Entrada inválida. Apenas números e operadores são permitidos.");
    }
});