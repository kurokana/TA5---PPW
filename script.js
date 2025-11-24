// Calculator State
let currentValue = '0';
let expressionString = '';
let waitingForNewValue = false;
let history = [];

// DOM Elements
const display = document.getElementById('display');
const expression = document.getElementById('expression');
const historyList = document.getElementById('historyList');

// Initialize
updateDisplay();

// Random Color Generator
function getRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
        '#FF9FF3', '#54A0FF', '#48DBFB', '#FF6348', '#1DD1A1',
        '#FF6B81', '#5F27CD', '#00D2D3', '#FD79A8', '#A29BFE',
        '#6C5CE7', '#FDCB6E', '#E17055', '#74B9FF', '#A29BFE'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomGradient() {
    const color1 = getRandomColor();
    const color2 = getRandomColor();
    return `linear-gradient(135deg, ${color1}, ${color2})`;
}

function changeButtonColor(button) {
    const originalBg = button.style.background;
    button.style.background = getRandomGradient();
    button.classList.add('btn-color-change');
    
    // Kembalikan warna setelah 2 detik
    setTimeout(() => {
        button.style.background = originalBg;
        button.classList.remove('btn-color-change');
    }, 2000);
}

// Number Input
function appendNumber(num) {
    if (waitingForNewValue) {
        currentValue = num;
        waitingForNewValue = false;
    } else {
        currentValue = currentValue === '0' ? num : currentValue + num;
    }
    updateDisplay();
}

// Decimal Point
function appendDecimal() {
    if (waitingForNewValue) {
        currentValue = '0.';
        waitingForNewValue = false;
    } else if (!currentValue.includes('.')) {
        currentValue += '.';
    }
    updateDisplay();
}

// Set Operation
function setOperation(op) {
    if (currentValue === '' && expressionString === '') {
        return;
    }
    
    // Jika sudah ada angka yang diinput
    if (currentValue !== '') {
        expressionString += currentValue + ' ' + op + ' ';
        currentValue = '';
        waitingForNewValue = false;
    } else if (expressionString !== '') {
        // Ganti operator terakhir jika user mengubah operator
        expressionString = expressionString.trim();
        const lastChar = expressionString[expressionString.length - 1];
        if (['+', '-', '×', '÷'].includes(lastChar)) {
            expressionString = expressionString.slice(0, -1) + op + ' ';
        }
    }
    
    updateExpression();
    updateDisplay();
}

// Calculate Result dengan hirarki operasi
function calculate() {
    try {
        // Tambahkan angka terakhir ke expression
        let fullExpression = expressionString + currentValue;
        
        if (fullExpression.trim() === '' || fullExpression.trim() === currentValue) {
            return;
        }
        
        // Evaluasi expression dengan hirarki operasi
        const result = evaluateExpression(fullExpression);
        
        if (!isFinite(result)) {
            throw new Error('Hasil tidak valid');
        }
        
        // Add to history
        addToHistory(fullExpression, result);
        
        // Update state
        currentValue = result.toString();
        expressionString = '';
        waitingForNewValue = true;
        
        updateDisplay();
        updateExpression();
        
    } catch (error) {
        showError(error.message);
    }
}

// Fungsi untuk evaluasi expression dengan hirarki operasi
function evaluateExpression(expr) {
    // Parse expression menjadi array of tokens
    const tokens = expr.split(' ').filter(t => t !== '');
    
    if (tokens.length === 0) {
        return 0;
    }
    
    if (tokens.length === 1) {
        return parseFloat(tokens[0]);
    }
    
    // Konversi ke array of numbers dan operators
    const numbers = [];
    const operators = [];
    
    for (let i = 0; i < tokens.length; i++) {
        if (i % 2 === 0) {
            numbers.push(parseFloat(tokens[i]));
        } else {
            operators.push(tokens[i]);
        }
    }
    
    // Validasi
    if (numbers.length !== operators.length + 1) {
        throw new Error('Format perhitungan tidak valid');
    }
    
    // Step 1: Process × dan ÷ (hirarki tinggi)
    let i = 0;
    while (i < operators.length) {
        if (operators[i] === '×') {
            numbers[i] = numbers[i] * numbers[i + 1];
            numbers.splice(i + 1, 1);
            operators.splice(i, 1);
        } else if (operators[i] === '÷') {
            if (numbers[i + 1] === 0) {
                throw new Error('Tidak dapat membagi dengan nol');
            }
            numbers[i] = numbers[i] / numbers[i + 1];
            numbers.splice(i + 1, 1);
            operators.splice(i, 1);
        } else {
            i++;
        }
    }
    
    // Step 2: Process + dan - (hirarki rendah)
    i = 0;
    while (i < operators.length) {
        if (operators[i] === '+') {
            numbers[i] = numbers[i] + numbers[i + 1];
            numbers.splice(i + 1, 1);
            operators.splice(i, 1);
        } else if (operators[i] === '-') {
            numbers[i] = numbers[i] - numbers[i + 1];
            numbers.splice(i + 1, 1);
            operators.splice(i, 1);
        } else {
            i++;
        }
    }
    
    return numbers[0];
}

// Clear Functions
function clearAll() {
    currentValue = '0';
    expressionString = '';
    waitingForNewValue = false;
    updateDisplay();
    updateExpression();
}

function clearEntry() {
    currentValue = '0';
    waitingForNewValue = false;
    updateDisplay();
}

// Advanced Functions
function backspace() {
    if (waitingForNewValue || currentValue === '0') {
        return;
    }
    
    if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);
    } else {
        currentValue = '0';
    }
    updateDisplay();
}

function percentage() {
    if (currentValue === '' || currentValue === '0') {
        return;
    }
    
    const num = parseFloat(currentValue);
    currentValue = (num / 100).toString();
    waitingForNewValue = true;
    updateDisplay();
}

// Display Updates
function updateDisplay() {
    // Format number for display
    let displayValue = currentValue;
    
    // If it's a valid number, format it
    if (!isNaN(displayValue) && displayValue !== '') {
        const num = parseFloat(displayValue);
        // Limit decimal places to 10
        if (displayValue.includes('.') && !displayValue.endsWith('.')) {
            displayValue = num.toFixed(Math.min(10, (displayValue.split('.')[1] || '').length));
            // Remove trailing zeros
            displayValue = parseFloat(displayValue).toString();
        }
    }
    
    display.value = displayValue;
}

function updateExpression() {
    if (expressionString !== '') {
        expression.textContent = expressionString;
    } else {
        expression.textContent = '';
    }
}

// Error Display
function showError(message) {
    display.value = message;
    display.classList.add('error');
    
    setTimeout(() => {
        display.classList.remove('error');
        clearAll();
    }, 2000);
}

// History Functions
function addToHistory(expr, result) {
    const historyItem = {
        expression: expr,
        result: result,
        timestamp: new Date()
    };
    
    history.unshift(historyItem);
    
    // Keep only last 5 items
    if (history.length > 5) {
        history.pop();
    }
    
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="text-muted text-center">Belum ada perhitungan</p>';
        return;
    }
    
    historyList.innerHTML = '';
    
    history.forEach((item, index) => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'history-item';
        historyDiv.onclick = () => useHistoryResult(item.result);
        
        const exprDiv = document.createElement('div');
        exprDiv.className = 'history-expression';
        exprDiv.textContent = item.expression;
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'history-result';
        resultDiv.textContent = `= ${formatNumber(item.result)}`;
        
        historyDiv.appendChild(exprDiv);
        historyDiv.appendChild(resultDiv);
        historyList.appendChild(historyDiv);
    });
}

function useHistoryResult(result) {
    currentValue = result.toString();
    waitingForNewValue = true;
    updateDisplay();
}

function clearHistory() {
    history = [];
    updateHistoryDisplay();
}

function formatNumber(num) {
    // Format number with max 10 decimal places
    if (Number.isInteger(num)) {
        return num.toString();
    }
    return parseFloat(num.toFixed(10)).toString();
}

// Keyboard Support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Numbers
    if (key >= '0' && key <= '9') {
        event.preventDefault();
        appendNumber(key);
    }
    
    // Decimal point
    if (key === '.' || key === ',') {
        event.preventDefault();
        appendDecimal();
    }
    
    // Operations
    if (key === '+') {
        event.preventDefault();
        setOperation('+');
    }
    if (key === '-') {
        event.preventDefault();
        setOperation('-');
    }
    if (key === '*') {
        event.preventDefault();
        setOperation('×');
    }
    if (key === '/') {
        event.preventDefault();
        setOperation('÷');
    }
    
    // Calculate
    if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    }
    
    // Clear
    if (key === 'Escape') {
        event.preventDefault();
        clearAll();
    }
    
    // Backspace
    if (key === 'Backspace') {
        event.preventDefault();
        backspace();
    }
    
    // Percentage
    if (key === '%') {
        event.preventDefault();
        percentage();
    }
});

// Add button click animation with random color
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        changeButtonColor(this);
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
});
