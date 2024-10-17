const callBtns = document.querySelectorAll('.btn-call');
const liftIcons = document.querySelectorAll('.lift-image');
const arrivalTone = document.querySelector('#arrival-sound');
let liftConditions = Array(liftIcons.length).fill('idle');
let liftPositions = Array.from(liftIcons)
    .map(lift => lift.getBoundingClientRect().top + window.scrollY);

callBtns.forEach((btn) => {
    if (btn.classList.contains('btn-call')) {
        btn.addEventListener("click", () => {
            if(btn.classList.contains('btn-waiting') || btn.classList.contains('btn-arrived') ){
                return;
            }
            btn.classList.add('btn-waiting');
            btn.innerHTML = 'waiting';
            const btnRect = btn.getBoundingClientRect();
            const btnY = btnRect.top + window.scrollY;
            const btnX = btnRect.left + window.scrollX;
            const nearestLiftIdx = findNearestFreeLift(btnY);
            if (nearestLiftIdx !== -1) {
                operateLift(nearestLiftIdx, btnY, btn, btnX);
            } else {
                console.log('All lifts are currently busy');
                btn.innerHTML = 'waiting';
                waitForLift(btnY, btn);
            }
        });
    }
});

function findNearestFreeLift(targetY) {
    let nearestIdx = -1;
    let shortestDist = Infinity;
    liftPositions.forEach((liftY, index) => {
        if (liftConditions[index] === 'idle' && liftY !== targetY) {
            const dist = Math.abs(targetY - liftY);
            if (dist < shortestDist) {
                shortestDist = dist;
                nearestIdx = index;
            }
        }
    });
    return nearestIdx;
}

function operateLift(liftIdx, targetY, btn, btnX) {
    const lift = liftIcons[liftIdx];
    lift.style.position = 'absolute';
    lift.classList.remove('lift-black');
    lift.classList.add('lift-red');
    const currentLiftY = liftPositions[liftIdx];
    const distance = Math.abs(targetY - currentLiftY);
    const speed = 40;
    const arrivalTime = (distance / speed) * 1000;
    let totalSecs = Math.floor(arrivalTime / 1000);
    const liftRect = lift.getBoundingClientRect();
    const liftX = liftRect.left + window.scrollX;
    const msgElement = showMessage('', liftX, targetY);

    if (totalSecs <= 1) {
        msgElement.textContent = `0 min 1 sec`;
        console.log('1 second');
        setTimeout(() => {
            msgElement.remove();
            btn.classList.remove('btn-waiting');
            btn.classList.add('btn-arrived');
            btn.innerHTML = 'Arrived';
            lift.classList.remove('lift-red');
            lift.classList.add('lift-green');
            arrivalTone.play();
        }, arrivalTime);
    } else {
        const countdown = setInterval(() => {
            if (totalSecs <= 0) {
                clearInterval(countdown);
                console.log('Lift arrived');
                return;
            }
            let mins = Math.floor(totalSecs / 60);
            let secs = totalSecs % 60;
            msgElement.textContent = `${mins} mins ${secs} sec `;
            console.log(`${totalSecs} seconds remaining`);
            totalSecs--;
        }, 1000);
    }

    lift.style.top = `${currentLiftY}px`;
    lift.style.transition = `top ${arrivalTime / 1000}s `;
    setTimeout(() => {
        lift.style.top = `${targetY}px`;
    }, 300);

    liftPositions[liftIdx] = targetY;
    liftConditions[liftIdx] = 'moving';

    setTimeout(() => {
        btn.classList.remove('btn-waiting');
        btn.classList.add('btn-arrived');
        btn.innerHTML = 'Arrived';
        lift.classList.remove('lift-red');
        lift.classList.add('lift-green');
        arrivalTone.play();
        msgElement.remove();
    }, arrivalTime - 800);

    setTimeout(() => {
        resetLiftAndBtn(liftIdx, btn);
    }, arrivalTime + 200);
}

function showMessage(text, liftX, targetY) {
    const msgElement = document.createElement('div');
    msgElement.textContent = text;
    msgElement.style.position = 'absolute';
    msgElement.style.top = `${targetY}px`;
    msgElement.style.left = `${liftX}px`;
    msgElement.style.transform = 'translateX(-35%)';
    msgElement.style.color = 'black';
    msgElement.style.padding = '5px 10px';
    msgElement.style.borderRadius = '5px';
    msgElement.style.zIndex = '1000';
    msgElement.style.whiteSpace = 'nowrap';
    document.body.appendChild(msgElement);
    return msgElement;
}

function resetLiftAndBtn(liftIdx, btn) {
    btn.classList.remove('btn-arrived');
    btn.classList.add('btn-call');
    btn.innerHTML = 'call';
    const lift = liftIcons[liftIdx];
    lift.classList.remove('lift-green');
    lift.classList.add('lift-black');
    liftConditions[liftIdx] = 'idle';
}

function waitForLift(targetY, btn) {
    const pollInterval = setInterval(() => {
        const nearestLiftIdx = findNearestFreeLift(targetY);
        if (nearestLiftIdx !== -1) {
            clearInterval(pollInterval);
            operateLift(nearestLiftIdx, targetY, btn);
        }
    }, 1000);
}