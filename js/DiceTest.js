// Dice are CSS 3D solids. One sampled result drives both the faces and the check.
class DiceTest {
    static sample(target, random = Math.random) {
        const values = Array.from({ length: 4 }, () => Math.floor(random() * 6) + 1);
        const total = values.reduce((sum, value) => sum + value, 0);
        return { values, total, success: total >= target };
    }

    constructor(wrapper, { title, target, success, failure }) {
        this.wrapper = wrapper;
        this.target = target;
        this.copy = { success, failure };
        this.events = new AbortController();
        this.animations = [];
        this.previousFocus = document.activeElement;
        this.element = document.createElement('div');
        this.element.className = 'dice-test';
        this.element.setAttribute('role', 'dialog');
        this.element.setAttribute('aria-modal', 'true');
        this.element.setAttribute('aria-label', title);
        this.element.innerHTML = `<div class="dice-heading"><small></small><h2>Test your luck</h2><p>4d6 · total ${target} or more</p></div><div class="dice-table" aria-hidden="true"></div><div class="dice-verdict" role="status" aria-live="polite"></div><button class="dice-action">Throw dice</button>`;
        this.element.querySelector('small').textContent = title;
        this.button = this.element.querySelector('button');
        this.button.addEventListener('click', () => {
            if (this.result) this.finish(this.result);
            else this.roll();
        }, { signal: this.events.signal });
        this.element.addEventListener('keydown', event => {
            if (event.key === 'Tab') { event.preventDefault(); this.button.focus(); }
        }, { signal: this.events.signal });
        wrapper.appendChild(this.element);
        this.button.focus();
    }

    wait() { return new Promise(resolve => { this.resolve = resolve; }); }

    makeDie(value, index) {
        const shell = document.createElement('div');
        shell.className = `die-position die-position-${index}`;
        const die = document.createElement('div');
        die.className = 'die';
        // Front is the read face; opposite faces always sum to seven.
        const others = [1, 2, 3, 4, 5, 6].filter(n => n !== value && n !== 7 - value);
        const sides = [value, 7 - value, others[0], 7 - others[0], others[1], 7 - others[1]];
        const pips = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
        sides.forEach((faceValue, face) => {
            const side = document.createElement('div');
            side.className = `die-face die-face-${face}`;
            for (let i = 0; i < 9; i++) {
                const dot = document.createElement('i');
                if (pips[faceValue].includes(i)) dot.className = 'pip';
                side.appendChild(dot);
            }
            die.appendChild(side);
        });
        shell.appendChild(die);
        this.element.querySelector('.dice-table').appendChild(shell);
        return { shell, die };
    }

    async roll() {
        if (this.rolling || this.disposed) return;
        this.rolling = true;
        this.button.disabled = true;
        this.button.textContent = 'Rolling…';
        const result = DiceTest.sample(this.target);
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        result.values.forEach((value, index) => {
            const { shell, die } = this.makeDie(value, index);
            const z = [-19, 13, -32, 23][index];
            const settled = `rotateZ(${z}deg) rotateX(-18deg) rotateY(22deg)`;
            die.style.transform = settled;
            if (!reduced) {
                const timing = { duration: 1350 + index * 150, easing: 'linear', fill: 'both' };
                this.animations.push(shell.animate([
                    { transform: `translate(${-75 + index * 32}px, -240px) scale(1.3)`, opacity: 0, offset: 0 },
                    { transform: 'translate(18px, 12px) scale(.95)', opacity: 1, offset: .4 },
                    { transform: 'translate(-13px, -48px) scale(1.08)', offset: .59 },
                    { transform: 'translate(7px, 4px) scale(.98)', offset: .77 },
                    { transform: 'translate(-3px, -13px)', offset: .89 },
                    { transform: 'translate(0, 0) scale(1)', opacity: 1 }
                ], timing));
                this.animations.push(die.animate([
                    { transform: `rotateZ(${z + 190}deg) rotateX(690deg) rotateY(570deg)` },
                    { transform: `rotateZ(${z - 20}deg) rotateX(140deg) rotateY(180deg)`, offset: .6 },
                    { transform: settled }
                ], timing));
            }
        });
        await Promise.all(this.animations.map(animation => animation.finished.catch(() => {})));
        if (this.disposed) return;
        this.result = result;
        this.element.querySelector('h2').textContent = result.success ? 'Success!' : 'Failed';
        this.element.querySelector('.dice-verdict').textContent = `${result.values.join(' + ')} = ${result.total} / ${this.target}. ${this.copy[result.success ? 'success' : 'failure']}`;
        this.element.classList.add(result.success ? 'passed' : 'failed');
        this.button.disabled = false;
        this.button.textContent = 'Continue';
        this.button.focus();
    }

    finish(result = null) {
        if (this.disposed) return;
        this.disposed = true;
        this.animations.forEach(animation => animation.cancel());
        this.events.abort();
        this.element.remove();
        if (this.previousFocus?.isConnected) this.previousFocus.focus();
        this.resolve?.(result);
    }
}
if (typeof module !== 'undefined') module.exports = DiceTest;
