/**
 * Chatbot Widget - UBND Phường Tân Hưng
 * Text-only, fast responses using knowledge base
 */

(function() {
    'use strict';

    const CONFIG = {
        API_BASE: window.CHATBOT_API_BASE || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000' : 'https://ai-supporter-vn-backend.vercel.app'),
        API_PATH: window.CHATBOT_API_PATH || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '/api/chat' : '/api'),
        TIMEOUT: 45000
    };
    
    const STORAGE_KEY = 'chatbot_widget_cache';
    const MAX_CACHE = 80;
    
    let isOpen = false, isLoading = false;
    
    const toggleBtn = document.getElementById('chat-widget-toggle');
    const container = document.getElementById('chat-widget-container');
    const closeBtn = document.getElementById('chat-widget-close');
    const messagesArea = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    function init() {
        if (!toggleBtn || !container) return;
        toggleBtn.addEventListener('click', toggleWidget);
        closeBtn.addEventListener('click', closeWidget);
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeWidget(); });
    }
    
    function toggleWidget() { isOpen ? closeWidget() : openWidget(); }
    function openWidget() {
        isOpen = true;
        container.classList.add('open');
        toggleBtn.classList.add('open');
        chatInput.focus();
    }
    function closeWidget() { isOpen = false; container.classList.remove('open'); toggleBtn.classList.remove('open'); }
    
    function getCache() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }
    
    function setCache(text, reply) {
        try {
            const cache = getCache();
            const key = text.trim().toLowerCase();
            cache[key] = { reply, ts: Date.now() };
            const keys = Object.keys(cache);
            while (keys.length > MAX_CACHE) {
                delete cache[keys.shift()];
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
        } catch (e) {
            // ignore storage errors
        }
    }
    
    function getCachedReply(text) {
        const cache = getCache();
        const key = text.trim().toLowerCase();
        const entry = cache[key];
        if (!entry) return null;
        return entry.reply;
    }
    
    function getInstantReply(text) {
        const t = text.trim().toLowerCase();
        const map = {
            'xin chào': 'Chào bạn! Tôi là UBND Phường Tân Hưng, trợ lý ảo Phường Tân Hưng. Bạn cần hỗ trợ gì?',
            'chào': 'Chào bạn! Tôi là UBND Phường Tân Hưng, trợ lý ảo Phường Tân Hưng. Bạn cần hỗ trợ gì?',
            'hello': 'Chào bạn! Tôi là UBND Phường Tân Hưng, trợ lý ảo Phường Tân Hưng. Bạn cần hỗ trợ gì?',
            'bạn là ai': 'Tôi là UBND Phường Tân Hưng, trợ lý ảo Phường Tân Hưng. Tôi có thể giúp bạn tìm hiểu thông tin về phường, các thủ tục hành chính, và nhiều vấn đề khác.',
            'ai là bạn': 'Tôi là UBND Phường Tân Hưng, trợ lý ảo Phường Tân Hưng. Tôi có thể giúp bạn tìm hiểu thông tin về phường, các thủ tục hành chính, và nhiều vấn đề khác.',
            'bạn tên gì': 'Tôi là UBND Phường Tân Hưng, trợ lý ảo Phường Tân Hưng.',
            'tên bạn là gì': 'Tôi là UBND Phường Tân Hưng, trợ lý ảo Phường Tân Hưng.',
            'cảm ơn': 'Không có gì! Nếu bạn cần hỗ trợ thêm, cứ hỏi tôi nhé.',
            'cảm ơn bạn': 'Không có gì! Nếu bạn cần hỗ trợ thêm, cứ hỏi tôi nhé.',
            'tạm biệt': 'Tạm biệt bạn! Hẹn gặp lại.',
            'bye': 'Tạm biệt bạn! Hẹn gặp lại.',
            'hỗ trợ': 'Bạn cần hỗ trợ về vấn đề gì? Hãy đặt câu hỏi cụ thể để tôi giúp bạn nhé.',
            'giúp tôi': 'Tôi sẽ cố gắng giúp bạn. Bạn hãy nói rõ hơn vấn đề bạn cần hỗ trợ nhé.',
            'ubnd phường tân hưng': 'UBND phường Tân Hưng là cơ quan hành chính nhà nước ở phường Tân Hưng. Bạn cần biết thông tin gì về UBND phường?',
            'địa chỉ ubnd': 'UBND phường Tân Hưng đặt tại địa chỉ của phường. Bạn có thể liên hệ để được hướng dẫn chi tiết.',
            'liên hệ': 'Bạn có thể liên hệ với UBND phường Tân Hưng để được hỗ trợ chi tiết về các thủ tục hành chính.',
            'số điện thoại': 'Để biết số điện thoại chính xác, bạn vui lòng liên hệ UBND phường Tân Hưng để được hỗ trợ.',
        };
        for (const key in map) {
            if (t.includes(key)) {
                return map[key];
            }
        }
        return null;
    }
    
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text || isLoading) return;
        chatInput.value = '';
        sendBtn.disabled = true;
        isLoading = true;
        addMessage(text, 'user');
        const typingId = showTypingIndicator();
        
        const instant = getInstantReply(text);
        if (instant) {
            removeTypingIndicator(typingId);
            addMessage(instant, 'ai');
            setCache(text, instant);
            isLoading = false;
            sendBtn.disabled = false;
            chatInput.focus();
            return;
        }
        
        const cached = getCachedReply(text);
        if (cached) {
            removeTypingIndicator(typingId);
            addMessage(cached, 'ai');
            isLoading = false;
            sendBtn.disabled = false;
            chatInput.focus();
            return;
        }
        
        try {
            const response = await Promise.race([
                sendToAPI({ text }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), CONFIG.TIMEOUT))
            ]);
            removeTypingIndicator(typingId);
            if (response && response.text) {
                addMessage(response.text, 'ai');
                setCache(text, response.text);
            } else if (response && response.error) {
                addMessage('Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.', 'ai', true);
            }
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator(typingId);
            if (error && error.message === 'timeout') {
                addMessage('Máy chủ đang bận, vui lòng thử lại sau ít phút.', 'ai', true);
            } else {
                addMessage('Xin lỗi, có lỗi kết nối. Vui lòng thử lại sau.', 'ai', true);
            }
        } finally {
            isLoading = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }
    
    async function sendToAPI(data) {
        const url = CONFIG.API_BASE.replace(/\/$/, '') + CONFIG.API_PATH;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: controller.signal,
                keepalive: true
            });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    function addMessage(text, sender, isError = false) {
        if (!text) return;
        const div = document.createElement('div');
        div.className = `message ${sender}${isError ? ' error' : ''}`;
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        if (sender === 'ai') {
            const img = document.createElement('img');
            img.src = 'avatar.png';
            img.alt = 'Avatar';
            avatar.appendChild(img);
        }
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        div.appendChild(avatar);
        div.appendChild(bubble);
        messagesArea.appendChild(div);
        scrollToBottom();
    }
    
    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'message ai';
        div.innerHTML = '<div class="message-avatar"><img src="avatar.png" alt="Avatar"></div><div class="message-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
        messagesArea.appendChild(div);
        scrollToBottom();
        return id;
    }
    
    function removeTypingIndicator(id) { const el = document.getElementById(id); if (el) el.remove(); }
    function scrollToBottom() { messagesArea.scrollTop = messagesArea.scrollHeight; }
    
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
