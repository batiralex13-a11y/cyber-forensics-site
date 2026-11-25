const API_URL = "https://cyber-backend-1d7s.onrender.com";

let currentUsername = "Студент";
let selectedLabData = null;

const labDetails = {
    1: {
        video: "https://www.youtube.com/embed/M7DmpBdZ8l0?autoplay=1&controls=0&disablekb=1&modestbranding=1",
        type: "test",
        title: "Контрольный тест: Основы киберкриминалистики",
        questions: [
            "1. Что включает в себя процесс реагирования на инциденты?",
            "2. Какова главная цель расследования инцидентов (форензики)?",
            "3. К чему может привести несвоевременное реагирование на рядовой инцидент?",
            "4. Назовите средний масштаб ущерба от киберинцидентов в мире.",
            "5. Какие данные анализируют киберкриминалисты при расследовании?",
            "6. Зачем нужен непрерывный мониторинг ИТ-инфраструктуры?",
            "7. Какую команду PowerShell можно использовать для поиска файлов по хешу?",
            "8. Что такое Compromise Assessment?",
            "9. Какой регламент или стандарт упоминается для реагирования на инциденты?",
            "10. Какая частая ошибка совершается сотрудниками ИТ/ИБ при расследовании?"
        ]
    },
    2: {
        video: "https://www.youtube.com/embed/GjwwYgZYXHE?autoplay=1&controls=0&disablekb=1&modestbranding=1",
        type: "code",
        title: "Практикум: Написание команд для анализа дампов памяти (Volatility)",
        taskDescription: "Напишите команду утилиты Volatility для определения профиля операционной системы в загруженном дампе памяти:"
    },
    3: {
        video: "https://www.youtube.com/embed/dpd3JPm5XWE?autoplay=1&controls=0&disablekb=1&modestbranding=1",
        type: "code",
        title: "Практикум: Как происходит кибератака? Хакерство как оно есть",
        taskDescription: "Опишите ключевые этапы кибератаки (разведка, повышение привилегий, боковое перемещение) и методы защиты:"
    }
};

const bookChapters = {
    1: {
        title: "Раздел 2 — Сетевой трафик, логи, IP-адреса и заголовки (Н. Н. Федотов)",
        text: "При исследовании сетевой активности и перехвате трафика анализируют статистику соединений, логи серверов, обращения к DNS и заголовки сообщений. Привязку IP-адреса и доменного имени проверяют через справочные базы и маршрутизацию, учитывая динамические адреса, прокси-серверы и возможную подмену заголовков."
    },
    2: {
        title: "Введение и Раздел 3 — Целостность данных и короткоживущие следы (Н. Н. Федотов)",
        text: "Доступ к компьютерной информации идёт через цепочку технических и программных посредников, поэтому в форензике важна целостность данных с точностью до бита. Короткоживущие данные, включая содержимое оперативной памяти и активные соединения, фиксируют на этапе сбора, а при выключении ПК оценивают риск логических бомб."
    },
    3: {
        title: "Разделы 3–5 — Копирование носителей, хэши и экспертиза (Н. Н. Федотов)",
        text: "Исследование накопителей проводят по побитовому образу, а тождественность копии оригиналу подтверждают хэш-функциями. Технический эксперт отвечает на вопросы о файлах, следах и носителях, тогда как правовые оценки, например контрафактность ПО, относятся к компетенции юристов и следственных органов."
    }
};

function restoreProfileFromStorage() {
    const savedProfileRaw = localStorage.getItem("cyber_lab_profile");
    if (!savedProfileRaw) return;
    try {
        const profile = JSON.parse(savedProfileRaw);
        if (profile.fullname) {
            currentUsername = profile.fullname;
            document.getElementById("display-username").innerText = currentUsername;
            document.getElementById("auth-modal").style.display = "none";
        }
        if (profile.card) {
            document.getElementById("pay-card-input").value = profile.card;
        }
    } catch (e) {}
}

function handleRegister(event) {
    event.preventDefault();
    const fullname = document.getElementById("fullname").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const card = document.getElementById("card").value.trim();

    currentUsername = fullname || "Студент";
    document.getElementById("display-username").innerText = currentUsername;
    document.getElementById("pay-card-input").value = card;
    document.getElementById("auth-modal").style.display = "none";

    localStorage.setItem("cyber_lab_profile", JSON.stringify({ fullname: currentUsername, phone, card }));
}

async function fetchLabs() {
    try {
        const response = await fetch(`${API_URL}/labs`);
        const labs = await response.json();

        const container = document.getElementById("labs-container");
        container.innerHTML = "";

        labs.forEach(lab => {
            const labCard = document.createElement("div");
            labCard.className = "lab-card";
            labCard.id = `lab-${lab.id}`;
            labCard.innerHTML = `
                <h3>${lab.title}</h3>
                <span class="badge">Сложность: ${lab.difficulty}</span>
            `;
            labCard.onclick = () => selectLab(lab);
            container.appendChild(labCard);
        });
    } catch (error) {
        document.getElementById("labs-container").innerHTML =
            '<p style="color: #ff5555;">Не удалось подключиться к облачному бэкенду. Проверьте соединение.</p>';
    }
}

function selectLab(lab) {
    stopBookReading();
    document.querySelectorAll(".lab-card").forEach(card => card.classList.remove("active"));
    document.getElementById(`lab-${lab.id}`).classList.add("active");

    selectedLabData = lab;
    const panel = document.getElementById("active-panel");

    document.getElementById("selected-lab-title").innerText = lab.title;
    document.getElementById("selected-lab-desc").innerText = `Уровень сложности: ${lab.difficulty}. Изолированная среда подготовлена.`;

    panel.style.display = "block";
    document.getElementById("start-btn").style.display = "inline-block";
    document.getElementById("paywall").style.display = "none";
    document.getElementById("virtual-screen").style.display = "none";
    document.getElementById("audiobook-box").style.display = "none";
    document.getElementById("exam-box").style.display = "none";
    document.getElementById("agent-response").style.display = "none";
    document.getElementById("ai-chat-output").innerText = "Задайте вопрос ИИ-агенту, если возникли трудности с решением...";

    panel.scrollIntoView({ behavior: "smooth" });
}

function renderAudiobookForLab(labId) {
    const chapter = bookChapters[labId] || bookChapters[1];
    document.getElementById("audio-chapter-title").innerText = chapter.title;
    document.getElementById("audiobook-text").innerText = chapter.text;
    document.getElementById("audiobook-box").style.display = "block";
}

function speakBookFragment(text) {
    stopBookReading();
    if (!text || !("speechSynthesis" in window)) {
        alert("Озвучка текста в этом браузере не поддерживается.");
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ru-RU";
    utterance.rate = parseFloat(document.getElementById("audio-rate").value) || 1;

    const box = document.getElementById("audiobook-text");
    utterance.onstart = () => box.classList.add("is-reading");
    utterance.onend = () => box.classList.remove("is-reading");
    utterance.onerror = () => box.classList.remove("is-reading");

    window.speechSynthesis.speak(utterance);
}

function startBookReading() {
    const text = document.getElementById("audiobook-text").innerText.trim();
    speakBookFragment(text);
}

function readSelectedBookText() {
    const selected = window.getSelection ? window.getSelection().toString().trim() : "";
    const boxText = document.getElementById("audiobook-text").innerText;
    if (!selected || !boxText.includes(selected)) {
        alert("Сначала выдели мышкой фрагмент текста внутри блока аудиокниги.");
        return;
    }
    speakBookFragment(selected);
}

function stopBookReading() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
    const box = document.getElementById("audiobook-text");
    if (box) box.classList.remove("is-reading");
}

async function launchVirtualLab() {
    try {
        const res = await fetch(`${API_URL}/consume_traffic`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUsername, action_type: "launch_lab" })
        });
        const data = await res.json();

        updateTrafficUI(data.used_traffic);

        if (data.blocked) {
            document.getElementById("virtual-screen").style.display = "none";
            document.getElementById("audiobook-box").style.display = "none";
            document.getElementById("exam-box").style.display = "none";
            document.getElementById("start-btn").style.display = "none";
            document.getElementById("paywall").style.display = "block";
            return;
        }

        const details = labDetails[selectedLabData.id] || labDetails[1];
        document.getElementById("lesson-video").src = details.video;

        document.getElementById("exam-title").innerText = details.title;
        const contentContainer = document.getElementById("exam-content");
        contentContainer.innerHTML = "";
        document.getElementById("agent-response").style.display = "none";

        if (details.type === "test") {
            details.questions.forEach((q, index) => {
                contentContainer.innerHTML += `
                    <div class="question-item">
                        <strong>${q}</strong>
                        <label><input type="radio" name="q${index}" value="a"> Вариант А: Локализация и устранение угрозы</label>
                        <label><input type="radio" name="q${index}" value="b"> Вариант Б: Полное удаление системных файлов</label>
                        <label><input type="radio" name="q${index}" value="c"> Вариант В: Игнорирование инцидента</label>
                    </div>
                `;
            });
        } else {
            contentContainer.innerHTML = `
                <p style="color: var(--text-muted); font-size: 14px;">${details.taskDescription}</p>
                <textarea id="user-code-input" class="code-input-area" placeholder="Введите ответ или анализ атаки здесь..."></textarea>
            `;
        }

        document.getElementById("virtual-screen").style.display = "block";
        renderAudiobookForLab(selectedLabData.id);
        document.getElementById("exam-box").style.display = "block";
        document.getElementById("virtual-screen").scrollIntoView({ behavior: "smooth" });
    } catch (err) {
        alert("Ошибка связи с сервером при учете трафика.");
    }
}

async function submitExam() {
    const details = labDetails[selectedLabData.id] || labDetails[1];
    let userAnswers;

    if (details.type === "test") {
        userAnswers = [];
        for (let i = 0; i < 10; i++) {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            if (selected) userAnswers.push(selected.value);
        }
    } else {
        const codeInput = document.getElementById("user-code-input");
        userAnswers = codeInput ? codeInput.value : "";
    }

    try {
        const trafficRes = await fetch(`${API_URL}/consume_traffic`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUsername, action_type: "verify_task" })
        });
        const trafficData = await trafficRes.json();
        updateTrafficUI(trafficData.used_traffic);

        if (trafficData.blocked) {
            document.getElementById("virtual-screen").style.display = "none";
            document.getElementById("audiobook-box").style.display = "none";
            document.getElementById("exam-box").style.display = "none";
            document.getElementById("start-btn").style.display = "none";
            document.getElementById("paywall").style.display = "block";
            return;
        }

        const response = await fetch(`${API_URL}/verify_submission`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: currentUsername,
                lab_id: selectedLabData.id,
                answers: userAnswers
            })
        });

        const result = await response.json();
        const agentBox = document.getElementById("agent-response");
        agentBox.style.display = "block";

        if (result.success) {
            agentBox.className = "agent-response-box success";
            agentBox.innerHTML = `<strong>[Результат: ${result.score}]</strong><br>${result.feedback}`;
        } else {
            agentBox.className = "agent-response-box error";
            agentBox.innerHTML = `<strong>[Результат: ${result.score || "Ошибка"}]</strong><br>${result.feedback}`;
        }

        agentBox.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
        alert("Не удалось связаться с агентом проверки.");
    }
}

async function askAIAgent() {
    const inputField = document.getElementById("ai-question-input");
    const question = inputField.value.trim();
    if (!question) return;

    const outputBox = document.getElementById("ai-chat-output");
    outputBox.innerText = "🤖 ИИ-Агент думает над ответом...";

    try {
        const response = await fetch(`${API_URL}/ai_helper`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lab_id: selectedLabData ? selectedLabData.id : 1,
                question: question
            })
        });

        const data = await response.json();
        outputBox.innerText = data.answer;
        inputField.value = "";
    } catch (err) {
        outputBox.innerText = "⚠️ Ошибка соединения с ИИ-помощником.";
    }
}

function updateTrafficUI(usedGB) {
    const safeGB = Number(usedGB) || 0;
    const percent = Math.min(100, (safeGB / 20) * 100);
    document.getElementById("traffic-fill").style.width = percent + "%";
    document.getElementById("traffic-text").innerText = safeGB.toFixed(1) + " / 20 ГБ";
}

function openPaymentModal() {
    document.getElementById("payment-modal").style.display = "flex";
}

async function processPayment(event) {
    event.preventDefault();
    try {
        const res = await fetch(`${API_URL}/pay_subscription`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUsername })
        });
        const data = await res.json();

        alert("Оплата 100 000 сум с вашей карты успешно проведена! Лимит трафика обнулен.");
        updateTrafficUI(data.used_traffic);

        document.getElementById("payment-modal").style.display = "none";
        document.getElementById("paywall").style.display = "none";
        document.getElementById("start-btn").style.display = "inline-block";
    } catch (err) {
        alert("Ошибка проведения платежа через шлюз.");
    }
}

restoreProfileFromStorage();
fetchLabs();