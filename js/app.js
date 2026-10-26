/**
 * ПРАКТИЧНА РОБОТА №4: DOM, ІНТЕРАКТИВНІСТЬ ТА BOM
 * Файл підключено через атрибут defer
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. ВИБІРКА ЕЛЕМЕНТІВ DOM (querySelector / querySelectorAll)
    // ==========================================
    const themeToggleBtn = document.querySelector('#theme-toggle-btn');
    const likeBtn = document.querySelector('#like-btn');
    const likeCountSpan = document.querySelector('#like-count');
    const reviewForm = document.querySelector('#review-form');
    const authorInput = document.querySelector('#author-input');
    const commentInput = document.querySelector('#comment-input');
    const reviewsList = document.querySelector('#reviews-list');
    const reviewsCountSpan = document.querySelector('#reviews-count');
    
    // Modal elements
    const shareModalBtn = document.querySelector('#share-modal-btn');
    const shareModal = document.querySelector('#share-modal');
    const closeModalBtn = document.querySelector('#close-modal-btn');
    const copyUrlBtn = document.querySelector('#copy-url-btn');
    const shareUrlInput = document.querySelector('#share-url-input');
    const copyNotification = document.querySelector('#copy-notification');

    // Audio Player elements
    const globalAudioPlayer = document.querySelector('#global-audio-player');
    const audioSource = document.querySelector('#audio-source');
    const currentTrackTitle = document.querySelector('#current-track-title');
    const trackRows = document.querySelectorAll('.track-row');

    // ==========================================
    // 2. КЕРУВАННЯ СТАНОМ ІНТЕРФЕЙСУ (classList.toggle / localStorage - BOM)
    // ==========================================
    
    // Перевірка збереженої теми у localStorage (BOM)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    // Перемикання теми "Темна / Світла"
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        
        // Збереження вибору у BOM localStorage
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        
        console.log(`[BOM] Тему змінено на: ${isLight ? 'Light' : 'Dark'}`);
    });

    // ==========================================
    // 3. МІКРОІНТЕРАКЦІЇ: ЛІЧИЛЬНИК ВПОДОБАНЬ (SVG-лайк)
    // ==========================================
    let isLiked = false;
    let currentLikes = parseInt(likeCountSpan.textContent, 10) || 1248;

    likeBtn.addEventListener('click', () => {
        isLiked = !isLiked;
        likeBtn.classList.toggle('liked', isLiked);

        if (isLiked) {
            currentLikes += 1;
        } else {
            currentLikes -= 1;
        }
        likeCountSpan.textContent = currentLikes;
    });

    // ==========================================
    // 4. МЕДІА-КОНТРОЛЬ: ПЕРЕМКАННЯ ТРЕКІВ
    // ==========================================
    trackRows.forEach(row => {
        row.addEventListener('click', (e) => {
            // Зняти активний клас з усіх рядків
            trackRows.forEach(r => r.classList.remove('active-track'));

            // Додати активний стан до вибраного
            row.classList.add('active-track');

            const trackSrc = row.getAttribute('data-src');
            const trackTitle = row.getAttribute('data-title');

            // Оновлення джерела та виводу назви
            audioSource.src = trackSrc;
            currentTrackTitle.textContent = trackTitle;

            // Перезавантаження та відтворення плеєра
            globalAudioPlayer.load();
            globalAudioPlayer.play();
        });
    });

    // ГАРЯЧІ КЛАВІШІ ДЛЯ ПЛЕЄРА (подія keydown - Space for play/pause)
    window.addEventListener('keydown', (event) => {
        // Перевірка: якщо користувач вводить текст у форму - не перехоплювати Space
        const isInputFocused = document.activeElement.tagName === 'INPUT' || 
                               document.activeElement.tagName === 'TEXTAREA';

        if (event.code === 'Space' && !isInputFocused) {
            event.preventDefault(); // Скасування дефолтного скролу сторінки
            if (globalAudioPlayer.paused) {
                globalAudioPlayer.play();
            } else {
                globalAudioPlayer.pause();
            }
        }

        // Закриття модального вікна клавішею Escape
        if (event.code === 'Escape' && !shareModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // ==========================================
    // 5. ІНТЕРАКТИВНА ФОРМА ВІДГУКІВ З ВАЛІДАЦІЄЮ ТА ДИНАМІЧНИМ DOM
    // ==========================================
    let reviewsCount = parseInt(reviewsCountSpan.textContent, 10) || 2;

    reviewForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Скасування перезавантаження сторінки

        const authorText = authorInput.value.trim();
        const commentText = commentInput.value.trim();

        if (authorText === '' || commentText === '') {
            alert('Будь ласка, заповніть усі поля форми!');
            return;
        }

        // Динамічне створення нових вузлів DOM
        const newReviewCard = document.createElement('article');
        newReviewCard.classList.add('review-card');

        // Отримання поточної дати
        const currentDate = new Date().toLocaleDateString('uk-UA');

        newReviewCard.innerHTML = `
            <div class="review-header">
                <span class="review-author">${escapeHTML(authorText)}</span>
                <span class="review-date">${currentDate}</span>
            </div>
            <p class="review-text">${escapeHTML(commentText)}</p>
        `;

        // Додавання нового елемента на початок списку
        reviewsList.prepend(newReviewCard);

        // Оновлення лічильника
        reviewsCount += 1;
        reviewsCountSpan.textContent = reviewsCount;

        // Очищення полів форми
        reviewForm.reset();
    });

    // Функція безпечного виводу (захист від XSS)
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // ==========================================
    // 6. МОДАЛЬНЕ ВІКНО ТА BOM МЕТОДИ (navigator.clipboard)
    // ==========================================
    function openModal() {
        shareModal.classList.remove('hidden');
    }

    function closeModal() {
        shareModal.classList.add('hidden');
        copyNotification.classList.add('hidden');
    }

    shareModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    // Закриття при кліку на оверлей поза модалкою
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            closeModal();
        }
    });

    // Використання BOM API: navigator.clipboard
    copyUrlBtn.addEventListener('click', () => {
        shareUrlInput.select();
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrlInput.value)
                .then(() => {
                    copyNotification.classList.remove('hidden');
                })
                .catch(err => {
                    console.error('Помилка копіювання: ', err);
                });
        } else {
            // Fallback для застарілих браузерів
            document.execCommand('copy');
            copyNotification.classList.remove('hidden');
        }
    });

    // ==========================================
    // 7. ВЗАЄМОДІЯ З ОБ'ЄКТОМ WINDOW (BOM: scroll & innerWidth)
    // ==========================================
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.main-header');
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            header.style.boxShadow = 'none';
        }
    });

    console.log(`[BOM Window Width]: Поточна ширина екрана: ${window.innerWidth}px`);
});
