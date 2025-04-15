document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');

    // 从本地存储加载历史记录
    loadChatHistory();

    // 发送按钮点击事件
    sendBtn.addEventListener('click', sendMessage);

    // 输入框回车事件
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // 添加用户消息到聊天界面
        addMessage(message, 'user');
        userInput.value = '';

        // 显示"正在输入"指示器
        typingIndicator.style.display = 'block';
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // 调用后端API获取AI回复
        fetchAIResponse(message);
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender + '-message');
        messageDiv.textContent = text;
        chatContainer.insertBefore(messageDiv, typingIndicator);

        // 保存到本地存储
        saveChatHistory();

        // 滚动到底部
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function fetchAIResponse(question) {
        try {
            const response = await fetch('api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'question=' + encodeURIComponent(question)
            });

            if (!response.ok) {
                throw new Error('网络响应不正常');
            }

            const data = await response.json();

            // 隐藏"正在输入"指示器
            typingIndicator.style.display = 'none';

            // 添加AI回复到聊天界面
            if (data.answer) {
                addMessage(data.answer, 'ai');
            } else {
                addMessage('抱歉，未能获取有效的回答。', 'ai');
            }
        } catch (error) {
            typingIndicator.style.display = 'none';
            addMessage('发生错误: ' + error.message, 'ai');
            console.error('获取AI回复时出错:', error);
        }
    }

    function saveChatHistory() {
        const messages = chatContainer.querySelectorAll('.message');
        const history = [];

        messages.forEach(msg => {
            history.push({
                text: msg.textContent,
                sender: msg.classList.contains('user-message') ? 'user' : 'ai'
            });
        });

        localStorage.setItem('aiChatHistory', JSON.stringify(history));
    }

    function loadChatHistory() {
        const history = localStorage.getItem('aiChatHistory');
        if (history) {
            const messages = JSON.parse(history);

            messages.forEach(msg => {
                addMessage(msg.text, msg.sender);
            });
        } else {
            // 初始欢迎消息
            addMessage('您好！我是AI助手，请问有什么可以帮您的吗？', 'ai');
        }
    }
});