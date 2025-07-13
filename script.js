document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const passwordOutput = document.getElementById('password-output');
    const copyBtn = document.getElementById('copy-btn');
    const lengthSlider = document.getElementById('password-length');
    const lengthValue = document.getElementById('length-value');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const generateBtn = document.getElementById('generate-btn');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const historyList = document.getElementById('history-list');

    // 字符集
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // 密码历史记录
    let passwordHistory = [];
    const maxHistoryItems = 5;

    // 初始化
    generatePassword();
    updateSliderValue();

    // 事件监听器
    lengthSlider.addEventListener('input', updateSliderValue);
    generateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyPassword);
    
    // 当任何选项改变时，更新密码强度
    [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox, lengthSlider].forEach(element => {
        element.addEventListener('change', function() {
            updatePasswordStrength();
        });
    });

    // 更新滑块值显示
    function updateSliderValue() {
        lengthValue.textContent = lengthSlider.value;
        updatePasswordStrength();
    }

    // 生成密码
    function generatePassword() {
        // 确保至少选择了一种字符类型
        if (!uppercaseCheckbox.checked && !lowercaseCheckbox.checked && 
            !numbersCheckbox.checked && !symbolsCheckbox.checked) {
            alert('请至少选择一种字符类型');
            lowercaseCheckbox.checked = true;
            return;
        }

        let charset = '';
        if (uppercaseCheckbox.checked) charset += uppercase;
        if (lowercaseCheckbox.checked) charset += lowercase;
        if (numbersCheckbox.checked) charset += numbers;
        if (symbolsCheckbox.checked) charset += symbols;

        const passwordLength = lengthSlider.value;
        let password = '';

        // 确保密码包含所有选择的字符类型
        let charTypes = [];
        if (uppercaseCheckbox.checked) charTypes.push(uppercase);
        if (lowercaseCheckbox.checked) charTypes.push(lowercase);
        if (numbersCheckbox.checked) charTypes.push(numbers);
        if (symbolsCheckbox.checked) charTypes.push(symbols);

        // 首先从每种选择的字符类型中至少选择一个字符
        for (let type of charTypes) {
            password += type.charAt(Math.floor(Math.random() * type.length));
        }

        // 填充剩余的密码长度
        for (let i = charTypes.length; i < passwordLength; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        // 打乱密码字符顺序
        password = shuffleString(password);
        
        // 显示密码
        passwordOutput.value = password;
        
        // 更新密码强度
        updatePasswordStrength();
        
        // 添加到历史记录
        addToHistory(password);
    }

    // 打乱字符串
    function shuffleString(string) {
        let array = string.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }

    // 复制密码到剪贴板
    function copyPassword() {
        passwordOutput.select();
        document.execCommand('copy');
        
        // 显示复制成功提示
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 1500);
    }

    // 评估密码强度
    function evaluatePasswordStrength(password) {
        // 基于密码长度和字符多样性的简单评估
        let score = 0;
        
        // 长度评分
        if (password.length >= 16) {
            score += 40;
        } else if (password.length >= 12) {
            score += 30;
        } else if (password.length >= 8) {
            score += 20;
        } else {
            score += 10;
        }
        
        // 字符类型评分
        let hasUpper = /[A-Z]/.test(password);
        let hasLower = /[a-z]/.test(password);
        let hasNumber = /[0-9]/.test(password);
        let hasSymbol = /[^A-Za-z0-9]/.test(password);
        
        let typesCount = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
        score += typesCount * 15;
        
        return score;
    }

    // 更新密码强度显示
    function updatePasswordStrength() {
        const password = passwordOutput.value;
        const score = evaluatePasswordStrength(password);
        
        // 重置类
        strengthBar.className = '';
        
        // 设置强度级别
        if (score >= 80) {
            strengthBar.classList.add('very-strong');
            strengthText.textContent = '非常强';
        } else if (score >= 60) {
            strengthBar.classList.add('strong');
            strengthText.textContent = '强';
        } else if (score >= 40) {
            strengthBar.classList.add('medium');
            strengthText.textContent = '中';
        } else {
            strengthBar.classList.add('weak');
            strengthText.textContent = '弱';
        }
        
        // 设置进度条宽度
        strengthBar.style.width = score + '%';
    }

    // 添加密码到历史记录
    function addToHistory(password) {
        // 避免重复
        if (passwordHistory.includes(password)) return;
        
        // 添加到历史数组
        passwordHistory.unshift(password);
        
        // 保持历史记录不超过最大数量
        if (passwordHistory.length > maxHistoryItems) {
            passwordHistory.pop();
        }
        
        // 更新历史记录显示
        updateHistoryDisplay();
    }

    // 更新历史记录显示
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        passwordHistory.forEach(password => {
            const li = document.createElement('li');
            
            // 创建密码显示元素（隐藏部分字符）
            const passwordSpan = document.createElement('span');
            passwordSpan.textContent = maskPassword(password);
            li.appendChild(passwordSpan);
            
            // 创建复制按钮
            const copyButton = document.createElement('button');
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
            copyButton.addEventListener('click', function() {
                navigator.clipboard.writeText(password)
                    .then(() => {
                        // 显示复制成功提示
                        const originalText = copyButton.innerHTML;
                        copyButton.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            copyButton.innerHTML = originalText;
                        }, 1500);
                    });
            });
            
            li.appendChild(copyButton);
            historyList.appendChild(li);
        });
    }

    // 掩码密码，只显示前几个和后几个字符
    function maskPassword(password) {
        if (password.length <= 8) return password;
        return password.substring(0, 3) + '•••••' + password.substring(password.length - 3);
    }
}); 