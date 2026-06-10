// ══════════════════════════════════════════════════════════════════════════
// ARCADE GAME HUB — CORE CLIENT ENGINE
// Separated, enhanced, and professionally polished.
// Viewport-contained full flex layouts and personalized player telemetry.
// ══════════════════════════════════════════════════════════════════════════

// Global Error Handler Dashboard for safe preview environments
window.addEventListener('error', (e) => {
    const errDiv = document.createElement('div');
    errDiv.style = 'position:fixed;top:0;left:0;width:100%;background:rgba(239,68,68,0.95);color:white;padding:12px 20px;z-index:999999;font-family:monospace;font-size:11px;line-height:1.4;border-bottom:2px solid #ef4444;box-shadow:0 10px 30px rgba(0,0,0,0.5);display:flex;justify-content:between;align-items:center;';
    errDiv.innerHTML = `<div><strong>Arcade Client Error:</strong> ${e.message} at ${e.filename.split('/').pop()}:${e.lineno}</div><button onclick="this.parentElement.remove()" style="background:transparent;border:1px solid white;color:white;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:10px;margin-left:15px;">DISMISS</button>`;
    document.body.appendChild(errDiv);
});

document.addEventListener('DOMContentLoaded', () => {
    // ── SAFE LOCAL STORAGE SYSTEM ──
    const SafeStorage = (() => {
        let supported = true;
        try {
            localStorage.setItem('__test__', '1');
            localStorage.removeItem('__test__');
        } catch (e) {
            supported = false;
        }
        return {
            getItem: (key) => {
                if (!supported) return null;
                try { return localStorage.getItem(key); } catch (e) { return null; }
            },
            setItem: (key, val) => {
                if (!supported) return;
                try { localStorage.setItem(key, val); } catch (e) {}
            }
        };
    })();

    // ── NAVIGATION CONTROLLER ──
    const Navigation = (() => {
        function goTo(viewName) {
            // Stop any active game loops when navigating away from game views
            if (viewName === 'home') {
                if (typeof SNAKE !== 'undefined' && SNAKE.stop) SNAKE.stop();
                if (typeof CARRACE !== 'undefined' && CARRACE.stop) CARRACE.stop();
            } else {
                if (viewName !== 'snake' && typeof SNAKE !== 'undefined' && SNAKE.stop) SNAKE.stop();
                if (viewName !== 'car' && typeof CARRACE !== 'undefined' && CARRACE.stop) CARRACE.stop();
            }

            // Remove active classes from all views and tabs
            document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            
            // Add active class to targets
            const targetView = document.getElementById('view-' + viewName);
            const targetTab = document.querySelector(`.nav-tab[data-view="${viewName}"]`);
            
            if (targetView) targetView.classList.add('active');
            if (targetTab) targetTab.classList.add('active');

            // Game activation triggers (handles resizing and initializing clean states)
            if (viewName === 'snake') {
                SNAKE.resize();
            } else if (viewName === 'car') {
                CARRACE.resize();
            }
        }

        // Initialize event listeners
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', () => goTo(btn.dataset.view));
        });

        document.querySelectorAll('[data-goto]').forEach(card => {
            card.addEventListener('click', () => goTo(card.dataset.goto));
        });

        return { goTo };
    })();


    // ── USER PROFILE CONTROLLER ──
    const Profile = (() => {
        const usernameDlg = document.getElementById('dialog-username');
        const usernameInput = document.getElementById('username-input');
        const usernameSubmit = document.getElementById('username-submit');
        const avatarOpts = document.querySelectorAll('#avatar-selector .avatar-opt');
        
        let selectedAvatar = '👾';

        // Select avatar option
        avatarOpts.forEach(opt => {
            opt.addEventListener('click', () => {
                avatarOpts.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                selectedAvatar = opt.dataset.avatar;
            });
        });

        function updateHeader(name, avatar) {
            document.getElementById('profile-avatar').textContent = avatar;
            document.getElementById('profile-name').textContent = name;
        }

        function updateGameLabels(name) {
            const xLabel = document.getElementById('ttt-x-label');
            if (xLabel) xLabel.textContent = name.toUpperCase();
            const rpsLabel = document.getElementById('rps-player-label');
            if (rpsLabel) rpsLabel.textContent = name.toUpperCase();
        }

        function saveProfile() {
            let name = usernameInput.value.trim();
            if (!name) name = 'HERO';
            
            SafeStorage.setItem('arcade_username', name);
            SafeStorage.setItem('arcade_avatar', selectedAvatar);
            
            updateHeader(name, selectedAvatar);
            updateGameLabels(name);
            usernameDlg.close();
        }

        // Confirm triggers
        usernameSubmit.addEventListener('click', saveProfile);
        usernameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveProfile();
            }
        });

        // Edit callsign from header profile
        document.getElementById('header-profile').addEventListener('click', () => {
            const savedName = SafeStorage.getItem('arcade_username') || '';
            const savedAvatar = SafeStorage.getItem('arcade_avatar') || '👾';
            
            usernameInput.value = savedName;
            avatarOpts.forEach(opt => {
                if (opt.dataset.avatar === savedAvatar) {
                    opt.classList.add('active');
                    selectedAvatar = savedAvatar;
                } else {
                    opt.classList.remove('active');
                }
            });
            usernameDlg.showModal();
        });

        function checkStartup() {
            const savedName = SafeStorage.getItem('arcade_username');
            const savedAvatar = SafeStorage.getItem('arcade_avatar') || '👾';
            
            if (!savedName) {
                usernameDlg.showModal();
            } else {
                updateHeader(savedName, savedAvatar);
                updateGameLabels(savedName);
            }
        }

        // Delay checking callsign overlay for smooth presentation transition
        setTimeout(checkStartup, 300);

        return {
            getUsername: () => SafeStorage.getItem('arcade_username') || 'HERO'
        };
    })();


    // ══════════════════════════════════════════════════════════════════════════
    // 1. TIC-TAC-TOE GAME ENGINE
    // ══════════════════════════════════════════════════════════════════════════
    const TTT = (() => {
        let board, current, xW = 0, oW = 0, dr = 0, over;
        const WINS = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        const grid = document.getElementById('ttt-grid');
        const status = document.getElementById('ttt-status');
        const dlg = document.getElementById('dialog-ttt');

        function svgX() {
            return `<svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <line x1="12" y1="12" x2="36" y2="36" stroke="var(--accent)" stroke-width="4.5" stroke-linecap="round"/>
                <line x1="36" y1="12" x2="12" y2="36" stroke="var(--accent)" stroke-width="4.5" stroke-linecap="round"/>
            </svg>`;
        }

        function svgO() {
            return `<svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="14" stroke="#a78bfa" stroke-width="4.5" fill="none"/>
            </svg>`;
        }

        function getPlayerLabel(symbol) {
            if (symbol === 'X') {
                return Profile.getUsername();
            } else {
                return 'PLAYER O';
            }
        }

        function init() {
            board = Array(9).fill('');
            current = 'X';
            over = false;
            render();
            setStatus(`${getPlayerLabel('X')}'s turn`, '');
            updateScores();
        }

        function render() {
            grid.innerHTML = '';
            board.forEach((v, i) => {
                const cell = document.createElement('div');
                cell.className = 'ttt-cell' + (v ? ' ' + v.toLowerCase() : '');
                if (v) {
                    cell.innerHTML = v === 'X' ? svgX() : svgO();
                }
                cell.addEventListener('click', () => click(i));
                grid.appendChild(cell);
            });
        }

        function click(i) {
            if (over || board[i]) return;
            board[i] = current;
            render();
            
            const targetCell = grid.children[i];
            targetCell.classList.add('pop');
            
            const w = checkWin();
            if (w) {
                w.forEach(idx => {
                    setTimeout(() => {
                        grid.children[idx].classList.add('win-cell');
                    }, 80);
                });
                
                over = true;
                if (current === 'X') {
                    xW++;
                } else {
                    oW++;
                }
                updateScores();
                setStatus(`${getPlayerLabel(current)} wins!`, 'win');
                setTimeout(() => showDlg(`${getPlayerLabel(current).toUpperCase()} WINS!`, current === 'X' ? '🟢' : '🟣', `Take the telemetry victory in this round.`), 700);
            } else if (board.every(v => v)) {
                over = true;
                dr++;
                updateScores();
                setStatus("It's a draw!", 'draw');
                setTimeout(() => showDlg("IT'S A DRAW", '🤝', 'No winner this round. Try again!'), 400);
            } else {
                current = current === 'X' ? 'O' : 'X';
                setStatus(`${getPlayerLabel(current)}'s turn`, '');
            }
        }

        function checkWin() {
            for (const [a, b, c] of WINS) {
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    return [a, b, c];
                }
            }
            return null;
        }

        function setStatus(t, c) {
            status.textContent = t;
            status.className = 'status-msg' + (c ? ' ' + c : '');
        }

        function updateScores() {
            document.getElementById('ttt-x-wins').textContent = xW;
            document.getElementById('ttt-o-wins').textContent = oW;
            document.getElementById('ttt-draws').textContent = dr;
            document.getElementById('ttt-xs').textContent = xW;
            document.getElementById('ttt-os').textContent = oW;
            document.getElementById('ttt-ds').textContent = dr;
        }

        function showDlg(title, emoji, msg) {
            document.getElementById('dialog-ttt-title').textContent = title;
            document.getElementById('dialog-ttt-emoji').textContent = emoji;
            document.getElementById('dialog-ttt-msg').textContent = msg;
            dlg.showModal();
        }

        // Attach event listeners
        document.getElementById('ttt-reset').addEventListener('click', init);
        document.getElementById('ttt-reset-scores').addEventListener('click', () => {
            xW = oW = dr = 0;
            init();
        });
        
        // MODAL CTAs Navigation
        document.getElementById('dialog-ttt-close').addEventListener('click', () => {
            dlg.close();
            Navigation.goTo('home');
        });
        document.getElementById('dialog-ttt-next').addEventListener('click', () => {
            dlg.close();
            init();
        });

        return { init };
    })();


    // ══════════════════════════════════════════════════════════════════════════
    // 2. Futuristic SNAKE ENGINE
    // ══════════════════════════════════════════════════════════════════════════
    const SNAKE = (() => {
        const canvas = document.getElementById('snake-canvas');
        const ctx = canvas.getContext('2d');
        const statusEl = document.getElementById('snake-status');
        const scoreEl = document.getElementById('snake-score');
        const bestEl = document.getElementById('snake-best');
        const dlg = document.getElementById('dialog-snake');
        
        const CELL = 20;
        let cols, rows, snake, dir, nextDir, food, particles = [], score, best = 0, loop, running = false, paused = false;

        function resize() {
            const parentWidth = canvas.parentElement.clientWidth || 480;
            const w = Math.min(480, parentWidth - 16);
            const s = Math.floor(w / CELL) * CELL;
            canvas.width = s;
            canvas.height = s;
            cols = s / CELL;
            rows = s / CELL;
            if (!running) drawPlaceholderGrid();
        }

        function drawPlaceholderGrid() {
            ctx.fillStyle = '#030308';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255,255,255,0.015)';
            for (let x = 0; x < cols; x++) {
                for (let y = 0; y < rows; y++) {
                    ctx.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2);
                }
            }
        }

        function init() {
            resize();
            snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
            dir = { x: 1, y: 0 };
            nextDir = { x: 1, y: 0 };
            particles = [];
            score = 0;
            running = true;
            paused = false;
            
            scoreEl.textContent = 0;
            statusEl.textContent = 'Use arrows / WSAD or D-Pad';
            statusEl.className = 'status-msg';
            
            spawnFood();
            clearInterval(loop);
            loop = setInterval(tick, 140);
            draw();
        }

        function stop() {
            running = false;
            paused = false;
            clearInterval(loop);
            drawPlaceholderGrid();
        }

        function spawnFood() {
            do {
                food = {
                    x: Math.floor(Math.random() * cols),
                    y: Math.floor(Math.random() * rows)
                };
            } while (snake.some(s => s.x === food.x && s.y === food.y));
        }

        function burst(x, y) {
            for (let i = 0; i < 12; i++) {
                particles.push({
                    x: x * CELL + CELL / 2,
                    y: y * CELL + CELL / 2,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    life: 1.0,
                    r: Math.random() * 3 + 1.5,
                    color: `hsl(${35 + Math.random() * 20}, 95%, 60%)`
                });
            }
        }

        function tick() {
            if (!running || paused) return;
            dir = { ...nextDir };
            
            const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
            
            if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || 
                snake.some(s => s.x === head.x && s.y === head.y)) {
                gameOver();
                return;
            }
            
            snake.unshift(head);
            
            if (head.x === food.x && head.y === food.y) {
                score++;
                scoreEl.textContent = score;
                if (score > best) {
                    best = score;
                    bestEl.textContent = best;
                }
                burst(food.x, food.y);
                spawnFood();
            } else {
                snake.pop();
            }
            
            draw();
        }

        function draw() {
            const W = canvas.width;
            const H = canvas.height;
            
            ctx.fillStyle = '#030308';
            ctx.fillRect(0, 0, W, H);
            
            ctx.fillStyle = 'rgba(255,255,255,0.025)';
            for (let x = 0; x < cols; x++) {
                for (let y = 0; y < rows; y++) {
                    ctx.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2);
                }
            }
            
            const pulse = Math.sin(Date.now() / 120) * 1.5;
            const fs = CELL - 6 + pulse;
            const fx = food.x * CELL + (CELL - fs) / 2;
            const fy = food.y * CELL + (CELL - fs) / 2;
            
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 18;
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.roundRect(fx, fy, fs, fs, 6);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.beginPath();
            ctx.ellipse(fx + fs * 0.3, fy + fs * 0.3, fs * 0.16, fs * 0.1, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            
            particles = particles.filter(p => p.life > 0);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.05;
                p.vy += 0.12;
                
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;
            
            snake.forEach((seg, i) => {
                const t = i / Math.max(snake.length, 1);
                
                if (i === 0) {
                    ctx.fillStyle = '#00f5a0';
                    ctx.shadowColor = '#00f5a0';
                    ctx.shadowBlur = 14;
                    ctx.beginPath();
                    ctx.roundRect(seg.x * CELL + 1.5, seg.y * CELL + 1.5, CELL - 3, CELL - 3, 7);
                    ctx.fill();
                } else {
                    ctx.fillStyle = `hsl(${160 + t * 45}, 90%, ${52 - t * 15}%)`;
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    const bodyScale = Math.max(12, CELL - 3 - (t * 5));
                    const offset = (CELL - bodyScale) / 2;
                    ctx.roundRect(seg.x * CELL + offset, seg.y * CELL + offset, bodyScale, bodyScale, 4.5);
                    ctx.fill();
                }
            });
            ctx.shadowBlur = 0;
            
            if (snake.length > 0) {
                const h = snake[0];
                ctx.fillStyle = '#020208';
                const ex = h.x * CELL + CELL / 2;
                const fillY = h.y * CELL + CELL / 2;
                const ox = dir.y * 3.5;
                const oy = dir.x * 3.5;
                
                ctx.beginPath();
                ctx.arc(ex + ox + dir.x * 2.5, fillY + oy - dir.y * 2.5, 2.2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(ex - ox + dir.x * 2.5, fillY - oy - dir.y * 2.5, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.006)';
            for (let y = 0; y < H; y += 4) {
                ctx.fillRect(0, y, W, 1);
            }
        }

        function gameOver() {
            running = false;
            clearInterval(loop);
            const playerCallsign = Profile.getUsername();
            document.getElementById('dialog-snake-score').textContent = score;
            document.getElementById('dialog-snake-msg').textContent = 
                score >= best && score > 0 ? `NEW PERSONAL RECORD, ${playerCallsign.toUpperCase()}: ${score}! 🏆` : `${playerCallsign.toUpperCase()}, your snake ran into trouble.`;
            dlg.showModal();
        }

        function setDir(d) {
            const m = { 
                UP: { x: 0, y: -1 }, 
                DOWN: { x: 0, y: 1 }, 
                LEFT: { x: -1, y: 0 }, 
                RIGHT: { x: 1, y: 0 } 
            };
            const nd = m[d];
            if (!nd) return;
            if (nd.x === -dir.x && nd.y === -dir.y) return;
            nextDir = nd;
        }

        // Bind events
        document.addEventListener('keydown', e => {
            if (!document.getElementById('view-snake').classList.contains('active')) return;
            
            const keys = {
                ArrowUp: 'UP', w: 'UP', W: 'UP',
                ArrowDown: 'DOWN', s: 'DOWN', S: 'DOWN',
                ArrowLeft: 'LEFT', a: 'LEFT', A: 'LEFT',
                ArrowRight: 'RIGHT', d: 'RIGHT', D: 'RIGHT'
            };

            if (keys[e.key]) {
                e.preventDefault();
                setDir(keys[e.key]);
            }

            if (e.code === 'Space') {
                e.preventDefault();
                if (!running) {
                    init();
                } else {
                    paused = !paused;
                    statusEl.textContent = paused ? 'Paused' : 'Use arrows / WSAD or D-Pad';
                    statusEl.className = 'status-msg' + (paused ? ' draw' : '');
                }
            }
        });

        document.querySelectorAll('.dpad-btn').forEach(b => {
            b.addEventListener('click', () => setDir(b.dataset.dir));
        });

        document.getElementById('snake-start').addEventListener('click', init);
        document.getElementById('snake-pause').addEventListener('click', () => {
            if (!running) return;
            paused = !paused;
            statusEl.textContent = paused ? 'Paused' : 'Use arrows / WSAD or D-Pad';
            statusEl.className = 'status-msg' + (paused ? ' draw' : '');
        });
        
        // MODAL CTAs Navigation
        document.getElementById('dialog-snake-close').addEventListener('click', () => {
            dlg.close();
            Navigation.goTo('home');
        });
        document.getElementById('dialog-snake-retry').addEventListener('click', () => {
            dlg.close();
            init();
        });

        window.addEventListener('resize', () => {
            if (document.getElementById('view-snake').classList.contains('active')) {
                resize();
            }
        });

        return { init, stop, resize };
    })();


    // ══════════════════════════════════════════════════════════════════════════
    // 3. MEMORY FLIP Strategic Game
    // ══════════════════════════════════════════════════════════════════════════
    const MEMORY = (() => {
        const EMOJIS = ['🦊', '🐳', '🌙', '⚡', '🎯', '🔮', '🌊', '🦋'];
        const grid = document.getElementById('mem-grid');
        const movesEl = document.getElementById('mem-moves');
        const pairsEl = document.getElementById('mem-pairs');
        const statusEl = document.getElementById('mem-status');
        const dlg = document.getElementById('dialog-memory');
        let flipped, matched, moves, lock;

        function shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function init() {
            const deck = shuffle([...EMOJIS, ...EMOJIS]);
            flipped = [];
            matched = 0;
            moves = 0;
            lock = false;
            
            movesEl.textContent = 0;
            pairsEl.textContent = '0';
            statusEl.textContent = 'Flip cards to match the pairs';
            statusEl.className = 'status-msg';
            grid.innerHTML = '';
            
            deck.forEach((emoji, i) => {
                const card = document.createElement('div');
                card.className = 'mem-card';
                card.dataset.emoji = emoji;
                card.dataset.index = i;
                
                card.innerHTML = `<div class="mem-inner">
                    <div class="mem-front">
                        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                            <rect x="2" y="2" width="24" height="24" rx="6" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1.5"/>
                            <text x="14" y="18.5" font-size="11" fill="rgba(255,255,255,0.18)" text-anchor="middle" font-family="monospace" font-weight="bold">?</text>
                        </svg>
                    </div>
                    <div class="mem-back">${emoji}</div>
                </div>`;
                
                card.addEventListener('click', () => flip(card));
                grid.appendChild(card);
            });
        }

        function flip(card) {
            if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
            
            card.classList.add('flipped');
            flipped.push(card);
            
            if (flipped.length === 2) {
                moves++;
                movesEl.textContent = moves;
                lock = true;
                
                const [a, b] = flipped;
                if (a.dataset.emoji === b.dataset.emoji) {
                    setTimeout(() => {
                        a.classList.add('matched');
                        b.classList.add('matched');
                        a.classList.remove('flipped');
                        b.classList.remove('flipped');
                        
                        matched++;
                        pairsEl.textContent = matched;
                        flipped = [];
                        lock = false;

                        if (matched === EMOJIS.length) {
                            setTimeout(() => {
                                const playerCallsign = Profile.getUsername();
                                document.getElementById('dialog-mem-moves').textContent = moves;
                                const evaluation = moves <= 12 ? `Absolute genius memory, ${playerCallsign}! 🧠` : moves <= 18 ? `Impressive skill, ${playerCallsign}! 👏` : `Well done, ${playerCallsign}!`;
                                document.getElementById('dialog-mem-msg').textContent = `${evaluation} Telemetry grid matched in ${moves} moves.`;
                                dlg.showModal();
                            }, 450);
                        }
                    }, 300);
                } else {
                    setTimeout(() => {
                        a.classList.remove('flipped');
                        b.classList.remove('flipped');
                        flipped = [];
                        lock = false;
                    }, 1100);
                }
            }
        }

        document.getElementById('mem-reset').addEventListener('click', init);
        
        // MODAL CTAs Navigation
        document.getElementById('dialog-mem-close').addEventListener('click', () => {
            dlg.close();
            Navigation.goTo('home');
        });
        document.getElementById('dialog-mem-play').addEventListener('click', () => {
            dlg.close();
            init();
        });

        return { init };
    })();

    MEMORY.init();


    // ══════════════════════════════════════════════════════════════════════════
    // 4. SPEED CAR — RACING ENGINE
    // ══════════════════════════════════════════════════════════════════════════
    const CARRACE = (() => {
        const canvas = document.getElementById('car-canvas');
        const ctx = canvas.getContext('2d');
        const statusEl = document.getElementById('car-status');
        const scoreEl = document.getElementById('car-score');
        const bestEl = document.getElementById('car-best');
        const speedEl = document.getElementById('car-speed');
        const dlg = document.getElementById('dialog-car');
        
        const LANES = 4;
        let W, H, laneW, roadL, roadR;
        let player, obstacles, dashY, score, best = 0, rAF, running = false, paused = false, speed, frame;

        function resize() {
            const parent = canvas.parentElement;
            const mw = Math.min(340, (parent ? parent.clientWidth : 340) - 16);
            canvas.width = mw;
            canvas.height = Math.round(mw * 1.41);
            W = canvas.width;
            H = canvas.height;
            roadL = W * 0.05;
            roadR = W * 0.95;
            laneW = (roadR - roadL) / LANES;
            if (!running) drawPlaceholderRoad();
        }

        function drawPlaceholderRoad() {
            ctx.fillStyle = '#020206';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Grass shoulders
            ctx.fillStyle = '#050705';
            ctx.fillRect(0, 0, roadL, canvas.height);
            ctx.fillRect(roadR, 0, canvas.width - roadR, canvas.height);
            // Gray road
            ctx.fillStyle = '#0c0c16';
            ctx.fillRect(roadL, 0, roadR - roadL, canvas.height);
        }

        function laneCenter(laneIndex) {
            return roadL + laneIndex * laneW + laneW / 2;
        }

        function init() {
            resize();
            const cw = laneW * 0.54, ch = cw * 1.8;
            player = {
                lane: 1,
                x: laneCenter(1),
                targetX: laneCenter(1),
                y: H - ch - 16,
                w: cw,
                h: ch,
                flameState: 0
            };
            
            obstacles = [];
            dashY = [0, H/4, H/2, 3*H/4].map(y => ({ x: roadL + laneW, y }));
            dashY = [...dashY, ...[0, H/3, 2*H/3].map(y => ({ x: roadL + laneW * 2, y }))];
            dashY = [...dashY, ...[0, H/4, H/2, 3*H/4].map(y => ({ x: roadL + laneW * 3, y }))];
            
            score = 0;
            speed = 4.2;
            frame = 0;
            running = true;
            paused = false;
            
            scoreEl.textContent = 0;
            speedEl.textContent = '1';
            statusEl.textContent = '← → or WSAD / buttons to steer';
            statusEl.className = 'status-msg';
            
            cancelAnimationFrame(rAF);
            rAF = requestAnimationFrame(loop);
        }

        function stop() {
            running = false;
            paused = false;
            cancelAnimationFrame(rAF);
            drawPlaceholderRoad();
        }

        const OBSTACLE_PALETTES = [
            { b: '#ff3366', r: '#880022', l: '#ffeef2', tl: 'rgba(255,51,102,0.85)' },
            { b: '#00f0ff', r: '#005577', l: '#eefcff', tl: 'rgba(0,240,255,0.85)' },
            { b: '#7c3aed', r: '#3b1080', l: '#f5f0ff', tl: 'rgba(124,58,237,0.85)' },
            { b: '#f59e0b', r: '#7c4d00', l: '#fffbeb', tl: 'rgba(245,158,11,0.85)' },
            { b: '#10b981', r: '#005c3c', l: '#ecfdf5', tl: 'rgba(16,185,129,0.85)' }
        ];

        function spawnObs() {
            const lane = Math.floor(Math.random() * LANES);
            const palette = OBSTACLE_PALETTES[Math.floor(Math.random() * OBSTACLE_PALETTES.length)];
            const cw = laneW * 0.54, ch = cw * 1.8;
            
            if (obstacles.length > 0) {
                const latest = obstacles[obstacles.length - 1];
                if (latest.y < ch * 1.6) return;
            }
            
            obstacles.push({
                lane,
                w: cw,
                h: ch,
                cx: laneCenter(lane),
                y: -ch - 10,
                c: palette
            });
        }

        function loop() {
            if (running && !paused) {
                frame++;
                score++;
                
                const disp = Math.floor(score / 9);
                scoreEl.textContent = disp;
                if (disp > best) {
                    best = disp;
                    bestEl.textContent = best;
                }

                if (frame % 180 === 0) {
                    speed = Math.min(speed + 0.4, 11);
                    speedEl.textContent = Math.round(speed / 3);
                }

                const spawnInterval = Math.max(24, 62 - Math.floor(speed * 2.2));
                if (frame % spawnInterval === 0) {
                    spawnObs();
                }

                player.x += (player.targetX - player.x) * 0.22;
                player.flameState = (player.flameState + 1) % 4;

                dashY.forEach(d => {
                    d.y += speed;
                    if (d.y > H) d.y -= H;
                });

                obstacles.forEach(o => o.y += speed);
                obstacles = obstacles.filter(o => o.y < H + 80);

                const px = player.x - player.w / 2;
                const py = player.y;
                const pw = player.w;
                const ph = player.h;
                
                for (const o of obstacles) {
                    const ox = o.cx - o.w / 2;
                    if (px + 4 < ox + o.w - 4 && 
                        px + pw - 4 > ox + 4 && 
                        py + 8 < o.y + o.h - 8 && 
                        py + ph - 8 > o.y + 8) {
                        gameOver();
                        return;
                    }
                }

                draw();
            }
            
            rAF = requestAnimationFrame(loop);
        }

        function drawCar(cx, y, w, h, c, isPlayer) {
            const x = cx - w / 2;
            
            ctx.shadowColor = isPlayer ? '#00f5a0' : c.b;
            ctx.shadowBlur = isPlayer ? 22 : 12;
            ctx.fillStyle = isPlayer ? 'rgba(0, 245, 160, 0.12)' : `${c.b}26`;
            ctx.beginPath();
            ctx.ellipse(cx, y + h * 0.5, w * 0.45, h * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (isPlayer && running && !paused) {
                const flameH = 8 + (player.flameState * 3) + (speed * 0.35);
                ctx.fillStyle = '#ff6b00';
                ctx.shadowColor = '#ff3c00';
                ctx.shadowBlur = 10;
                
                ctx.beginPath();
                ctx.moveTo(cx - w * 0.25, y + h * 0.75);
                ctx.lineTo(cx - w * 0.35, y + h * 0.75 + flameH);
                ctx.lineTo(cx - w * 0.15, y + h * 0.75);
                ctx.closePath();
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(cx + w * 0.25, y + h * 0.75);
                ctx.lineTo(cx + w * 0.15, y + h * 0.75 + flameH);
                ctx.lineTo(cx + w * 0.35, y + h * 0.75);
                ctx.closePath();
                ctx.fill();
                
                ctx.shadowBlur = 0;
            }

            const ww = w * 0.22;
            const wh = h * 0.16;
            ctx.fillStyle = '#05050a';
            
            [[x - ww * 0.35, y + h * 0.08], [x + w - ww * 0.65, y + h * 0.08], 
             [x - ww * 0.35, y + h * 0.52], [x + w - ww * 0.65, y + h * 0.52]].forEach(([wx, wy]) => {
                ctx.beginPath();
                ctx.roundRect(wx, wy, ww, wh, 3.5);
                ctx.fill();
            });

            ctx.fillStyle = isPlayer ? '#00f5a0' : c.b;
            ctx.beginPath();
            ctx.roundRect(x, y + h * 0.1, w, h * 0.68, 8);
            ctx.fill();

            ctx.fillStyle = isPlayer ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.08)';
            ctx.beginPath();
            ctx.roundRect(x + w * 0.3, y + h * 0.1, w * 0.4, h * 0.68, 4);
            ctx.fill();

            ctx.fillStyle = isPlayer ? '#004732' : c.r;
            ctx.beginPath();
            ctx.roundRect(x + w * 0.16, y - h * 0.18, w * 0.68, h * 0.36, 6);
            ctx.fill();

            ctx.fillStyle = 'rgba(160, 240, 255, 0.26)';
            ctx.beginPath();
            ctx.roundRect(x + w * 0.2, y - h * 0.14, w * 0.6, h * 0.16, 3.5);
            ctx.fill();

            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.beginPath();
            ctx.roundRect(x + w * 0.22, y - h * 0.13, w * 0.18, h * 0.06, 2);
            ctx.fill();

            const hlY = isPlayer ? y + h * 0.1 : y + h * 0.72;
            ctx.fillStyle = isPlayer ? '#fef08a' : c.l;
            ctx.shadowColor = isPlayer ? '#fef08a' : c.l;
            ctx.shadowBlur = 8;
            
            ctx.beginPath();
            ctx.roundRect(x + w * 0.08, hlY, w * 0.18, h * 0.05, 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.roundRect(x + w * 0.74, hlY, w * 0.18, h * 0.05, 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;

            if (!isPlayer) {
                ctx.fillStyle = c.tl;
                ctx.shadowColor = c.tl;
                ctx.shadowBlur = 7;
                ctx.beginPath();
                ctx.roundRect(x + w * 0.08, y + h * 0.1, w * 0.16, h * 0.04, 2);
                ctx.fill();
                ctx.beginPath();
                ctx.roundRect(x + w * 0.76, y + h * 0.1, w * 0.16, h * 0.04, 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        function draw() {
            ctx.fillStyle = '#04040a';
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = '#060a06';
            ctx.fillRect(0, 0, roadL, H);
            ctx.fillRect(roadR, 0, W - roadR, H);

            ctx.fillStyle = 'rgba(0, 245, 160, 0.012)';
            ctx.fillRect(0, 0, roadL, H);
            ctx.fillRect(roadR, 0, W - roadR, H);

            const roadGradient = ctx.createLinearGradient(roadL, 0, roadR, 0);
            roadGradient.addColorStop(0, '#0c0c18');
            roadGradient.addColorStop(0.5, '#121224');
            roadGradient.addColorStop(1, '#0c0c18');
            ctx.fillStyle = roadGradient;
            ctx.fillRect(roadL, 0, roadR - roadL, H);

            const stripeH = 34;
            for (let y = -stripeH; y < H + stripeH; y += stripeH * 2) {
                const offset = (frame * speed * 0.55) % (stripeH * 2);
                const curY = y - offset;
                
                ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
                ctx.fillRect(roadL - 8, curY, 8, stripeH);
                ctx.fillRect(roadR, curY, 8, stripeH);
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(roadL - 8, curY + stripeH, 8, stripeH);
                ctx.fillRect(roadR, curY + stripeH, 8, stripeH);
            }

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(roadL, 0);
            ctx.lineTo(roadL, H);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(roadR, 0);
            ctx.lineTo(roadR, H);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 230, 80, 0.26)';
            ctx.lineWidth = 1.8;
            ctx.setLineDash([26, 20]);
            
            dashY.forEach(d => {
                ctx.beginPath();
                ctx.moveTo(d.x, d.y - H * 0.1);
                ctx.lineTo(d.x, d.y + H * 0.18);
                ctx.stroke();
            });
            ctx.setLineDash([]);

            if (speed > 8.5) {
                const alpha = Math.min((speed - 8.5) / 16, 0.55);
                ctx.strokeStyle = `rgba(0, 245, 160, ${alpha})`;
                ctx.lineWidth = 1.0;
                
                for (let i = 0; i < 4; i++) {
                    const sx = Math.random() * (roadL - 10);
                    const sy = Math.random() * H;
                    const sl = 22 + Math.random() * 26;
                    
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(sx, sy + sl);
                    ctx.stroke();

                    const ex = roadR + 10 + Math.random() * (W - roadR - 10);
                    ctx.beginPath();
                    ctx.moveTo(ex, sy);
                    ctx.lineTo(ex, sy + sl);
                    ctx.stroke();
                }
            }

            obstacles.forEach(o => drawCar(o.cx, o.y, o.w, o.h, o.c, false));
            drawCar(player.x, player.y, player.w, player.h, null, true);
        }

        function gameOver() {
            running = false;
            cancelAnimationFrame(rAF);
            const finalScore = Math.floor(score / 9);
            const playerCallsign = Profile.getUsername();
            document.getElementById('dialog-car-score').textContent = finalScore;
            document.getElementById('dialog-car-msg').textContent = 
                finalScore >= best && finalScore > 0 ? `NEW TELEMETRY RECORD, ${playerCallsign.toUpperCase()}: ${finalScore}! 🏆` : `${playerCallsign.toUpperCase()}, impact detected. Final score: ${finalScore}`;
            dlg.showModal();
        }

        function steer(dir) {
            if (!running || paused) return;
            const nextLane = player.lane + (dir === 'left' ? -1 : 1);
            if (nextLane < 0 || nextLane >= LANES) return;
            
            player.lane = nextLane;
            player.targetX = laneCenter(nextLane);
        }

        document.addEventListener('keydown', e => {
            if (!document.getElementById('view-car').classList.contains('active')) return;
            
            const actions = {
                ArrowLeft: 'left', a: 'left', A: 'left',
                ArrowRight: 'right', d: 'right', D: 'right'
            };

            if (actions[e.key]) {
                e.preventDefault();
                steer(actions[e.key]);
            }

            if (e.code === 'Space') {
                e.preventDefault();
                if (!running) {
                    init();
                } else {
                    paused = !paused;
                    statusEl.textContent = paused ? 'Paused' : '← → or WSAD / buttons to steer';
                    statusEl.className = 'status-msg' + (paused ? ' draw' : '');
                }
            }
        });

        document.getElementById('car-left').addEventListener('click', () => steer('left'));
        document.getElementById('car-right').addEventListener('click', () => steer('right'));
        
        document.getElementById('car-start').addEventListener('click', init);
        document.getElementById('car-pause').addEventListener('click', () => {
            if (!running) return;
            paused = !paused;
            statusEl.textContent = paused ? 'Paused' : '← → or WSAD / buttons to steer';
            statusEl.className = 'status-msg' + (paused ? ' draw' : '');
        });

        // MODAL CTAs Navigation
        document.getElementById('dialog-car-close').addEventListener('click', () => {
            dlg.close();
            Navigation.goTo('home');
        });
        document.getElementById('dialog-car-retry').addEventListener('click', () => {
            dlg.close();
            init();
        });

        window.addEventListener('resize', () => {
            if (document.getElementById('view-car').classList.contains('active')) {
                resize();
            }
        });

        return { init, stop, resize };
    })();

    // ══════════════════════════════════════════════════════════════════════════
    // 5. ROCK-PAPER-SCISSORS MAIN ENGINE
    // ══════════════════════════════════════════════════════════════════════════
    const RPS = (() => {
        const choices = ["Rock", "Paper", "Scissors"];
        const emojis = {
            "Rock": "🪨",
            "Paper": "📄",
            "Scissors": "✂️",
            "✊": "✊",
            "❓": "❓"
        };
        
        let playerScore = 0;
        let computerScore = 0;
        let isAnimating = false;
        
        const playerCard = document.getElementById('rps-player-card');
        const computerCard = document.getElementById('rps-computer-card');
        const playerChoiceEl = document.getElementById('rps-player-choice');
        const computerChoiceEl = document.getElementById('rps-computer-choice');
        
        const playerScoreEl = document.getElementById('rps-player-score');
        const computerScoreEl = document.getElementById('rps-computer-score');
        const statusEl = document.getElementById('rps-status');
        const dlg = document.getElementById('dialog-rps');
        
        const buttons = document.querySelectorAll('.rps-choice-btn');
        
        function init() {
            playerScore = 0;
            computerScore = 0;
            isAnimating = false;
            
            playerScoreEl.textContent = '0';
            computerScoreEl.textContent = '0';
            
            statusEl.textContent = 'Choose your weapon to start the match';
            statusEl.className = 'status-msg';
            
            playerChoiceEl.textContent = '❓';
            computerChoiceEl.textContent = '❓';
            
            playerCard.className = 'fighter-card';
            computerCard.className = 'fighter-card';
            
            buttons.forEach(btn => btn.removeAttribute('disabled'));
            
            const playerCallsign = Profile.getUsername();
            const rpsLabel = document.getElementById('rps-player-label');
            if (rpsLabel) rpsLabel.textContent = playerCallsign.toUpperCase();
        }
        
        function getRandomComputerResult() {
            const randomIndex = Math.floor(Math.random() * choices.length);
            return choices[randomIndex];
        }
        
        function hasPlayerWonTheRound(playerChoice, computerChoice) {
            return (
                (playerChoice === "Rock" && computerChoice === "Scissors") ||
                (playerChoice === "Scissors" && computerChoice === "Paper") ||
                (playerChoice === "Paper" && computerChoice === "Rock")
            );
        }
        
        function playRound(playerChoice) {
            if (isAnimating || playerScore === 3 || computerScore === 3) return;
            
            isAnimating = true;
            buttons.forEach(btn => btn.setAttribute('disabled', 'true'));
            
            // Shaking animation setup
            playerChoiceEl.textContent = '✊';
            computerChoiceEl.textContent = '✊';
            playerCard.className = 'fighter-card rps-shaking';
            computerCard.className = 'fighter-card rps-shaking';
            
            statusEl.textContent = 'Computing matrix combat...';
            statusEl.className = 'status-msg';
            
            setTimeout(() => {
                playerCard.classList.remove('rps-shaking');
                computerCard.classList.remove('rps-shaking');
                
                const computerChoice = getRandomComputerResult();
                
                playerChoiceEl.textContent = emojis[playerChoice];
                computerChoiceEl.textContent = emojis[computerChoice];
                
                playerCard.classList.add('active-choice');
                computerCard.classList.add('active-choice');
                
                if (hasPlayerWonTheRound(playerChoice, computerChoice)) {
                    playerScore++;
                    playerScoreEl.textContent = playerScore;
                    statusEl.textContent = `ROUND WON: ${playerChoice.toUpperCase()} beats ${computerChoice.toUpperCase()}!`;
                    statusEl.className = 'status-msg win';
                } else if (playerChoice === computerChoice) {
                    statusEl.textContent = `ROUND TIE: Both chose ${playerChoice.toUpperCase()}!`;
                    statusEl.className = 'status-msg draw';
                } else {
                    computerScore++;
                    computerScoreEl.textContent = computerScore;
                    statusEl.textContent = `ROUND LOST: ${computerChoice.toUpperCase()} beats ${playerChoice.toUpperCase()}!`;
                    statusEl.className = 'status-msg lose';
                }
                
                isAnimating = false;
                buttons.forEach(btn => btn.removeAttribute('disabled'));
                
                // Check for game winner
                if (playerScore === 3 || computerScore === 3) {
                    setTimeout(() => {
                        const playerCallsign = Profile.getUsername();
                        const won = playerScore === 3;
                        
                        document.getElementById('dialog-rps-title').textContent = won ? 'Combat Victory!' : 'CPU Mainframe Wins';
                        document.getElementById('dialog-rps-emoji').textContent = won ? '🏆' : '🤖';
                        document.getElementById('dialog-rps-msg').textContent = won 
                            ? `Congratulations, ${playerCallsign.toUpperCase()}! You won the sector with ${playerScore}-${computerScore}.` 
                            : `Defeated by CPU telemetry. Mainframe won the sector ${computerScore}-${playerScore}.`;
                        
                        dlg.showModal();
                    }, 600);
                }
            }, 600);
        }
        
        // Event Listeners
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const choice = btn.dataset.choice;
                playRound(choice);
            });
        });
        
        // Modal Controls
        document.getElementById('dialog-rps-close').addEventListener('click', () => {
            dlg.close();
            Navigation.goTo('home');
        });
        
        document.getElementById('dialog-rps-retry').addEventListener('click', () => {
            dlg.close();
            init();
        });
        
        return { init };
    })();

    // Initialize all game instances immediately
    TTT.init();
    RPS.init();
});
