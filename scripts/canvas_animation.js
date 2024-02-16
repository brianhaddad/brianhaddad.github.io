function DrawBoundsRect(xLoc, yLoc, width, height) {
    this.x = xLoc;
    this.y = yLoc;
    this.w = width;
    this.h = height;
    this.cx = this.x + (width/2);
    this.cy = this.y + (height/2);
}

//politely borrowed from:
//https://www.30secondsofcode.org/js/s/hsb-to-rgb/
//The range of the input parameters is H: [0, 360], S: [0, 100], B: [0, 100].
function HSBToRGBstring(h, s, b, t) {
    t ??= 1;
    const fix = (n) => Math.max(Math.min(Math.round(n), 255), 0);
    s /= 100;
    b /= 100;
    const k = (n) => (n + h / 60) % 6;
    const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
    if (t > 0 && t < 1) {
        return `rgba(${fix(255 * f(5))},${fix(255 * f(3))},${fix(255 * f(1))},${t.toFixed(3)})`;
    }
    return `rgb(${fix(255 * f(5))},${fix(255 * f(3))},${fix(255 * f(1))})`;
}

const easing = {
    in: (t) => t * t,
    out: (t) => 1 - (1 - t) * (1 - t),
    inAndOut: (t) => t * t * (3.0 - 2.0 * t),
};

function LayeredAnimationCollection() {
    const layers = [];

    this.addLayer = (newLayer) => {
        layers.push(newLayer);
    };

    this.update = (dt) => {
        let isAlive = false;
        for (const layer of layers) {
            if (layer.update(dt)) {
                isAlive = true;
            }
        }
        return isAlive;
    };

    this.draw = (ctx, drawRect) => {
        ctx.save();
        ctx.translate(drawRect.x, drawRect.y);
        const newRect = new DrawBoundsRect(0, 0, drawRect.w, drawRect.h);
        for (const layer of layers) {
            layer.draw(ctx, newRect);
        }
        ctx.restore();
    };
}

function SequentialAnimationCollection() {
    let sequenceIndex = 0;
    const animations = [];

    this.addSequence = (newSequence) => {
        animations.push(newSequence);
    };

    this.update = (dt) => {
        if (sequenceIndex >= animations.length) {
            return false;
        }
        if (!animations[sequenceIndex].update(dt)) {
            sequenceIndex++;
        }
        return true;
    };

    this.draw = (ctx, drawRect) => {
        if (sequenceIndex >= animations.length) {
            return;
        }
        ctx.save();
        ctx.translate(drawRect.x, drawRect.y);
        const newRect = new DrawBoundsRect(0, 0, drawRect.w, drawRect.h);
        animations[sequenceIndex].draw(ctx, newRect);
        ctx.restore();
    };
}
/* 
 * updateFunc takes in a timeRemaining and totalAnimationTime, and returns a t between 0 and 1 (outside of this range will kill the animation)
 * animateFunc takes in ctx, a DrawBoundsRect, and a t value between 0 and 1 (doesn't matter what it returns)
 */
//TODO: instead of update functions and animate functions, might need classes to handle them
//that way we can get rid of the total animation time in the AnimationContainer class
//and the animator can handle things like physics.
function CountdownAnimationContainer(totalTime, updateFunc, animateFunc, delayStart) {
    let delay = delayStart ?? 0;
    const totalAnimationTime = totalTime;
    let timeRemaining = totalTime;
    const updater = updateFunc;
    const animator = animateFunc;
    let t = 0;

    const isActive = () => t >= 0 && t <= 1;

    this.update = (dt) => {
        if (delay > 0) {
            delay -= dt;
        }
        if (delay <= 0) {
            timeRemaining -= dt;
            t = updater(timeRemaining, totalAnimationTime);
        }
        return isActive();
    };

    this.draw = (ctx, drawRect) => {
        if (isActive()) {
            return animator(ctx, drawRect, t);
        }
        return null;
    };
}

function MakeFireworkSequence(x, y, delayStart) {
    const sequence = new SequentialAnimationCollection();
    sequence.addSequence(new FireworkLaunchTrail(x, y, delayStart));
    sequence.addSequence(new FireworkExplosion(x, y));
    return sequence;
}

function FireworkLaunchTrail(cx, cy, delayStart) {
    let elapsedTime = 0;
    //TODO: pass this in as a parameter? Wider launch time window?
    const totalLaunchTime = Math.floor(Math.random() * 1250) + 750;
    const xLocStart = cx;
    const yLocStart = 1.1; //TODO: pass in the value?
    const xLocTarget = cx;
    const yLocTarget = cy;
    let xLocCurrent = xLocStart;
    let yLocCurrent = yLocStart;
    let timeUntilBegin = delayStart ?? 0;
    let active = true;
    const particles = [];

    const addTrailParticle = () => {
        particles.push(new FireworkLaunchTrailParticle(Math.floor(Math.random() * 1000) + 500, xLocCurrent, yLocCurrent, ((Math.random() * 3) + 1) / 100));
    };

    this.update = (dt) => {
        if (timeUntilBegin > 0) {
            timeUntilBegin -= dt;
        }

        if (timeUntilBegin <= 0 && active) {
            elapsedTime += dt;
            const t = elapsedTime / totalLaunchTime;
            xLocCurrent = xLocStart + ((easing.out(t)) * (xLocTarget - xLocStart));
            yLocCurrent = yLocStart + ((easing.out(t)) * (yLocTarget - yLocStart));
            let weDead = (t >= 1);
            if (!weDead) {
                addTrailParticle();
            }
            for (const particle of particles) {
                if (particle.update(dt)) {
                    weDead = false;
                }
            }
            if (weDead) {
                active = false;
            }
        }
        return active;
    };

    this.draw = (ctx, drawRect) => {
        if (timeUntilBegin <= 0 && active) {
            ctx.save();
            ctx.translate(drawRect.cx, drawRect.cy);
            for (const particle of particles) {
                particle.draw(ctx, drawRect);
            }
            ctx.restore();
        }
        return null;
    };
}

function FireworkExplosion(cx, cy, delayStart) {
    const xLoc = cx;
    const yLoc = cy;
    let timeUntilBegin = delayStart ?? 0;
    let active = true;
    const particles = [];
    const numParticles = Math.floor(Math.random() * 500) + 500;

    const getAngle = () => ((Math.random() * 2 * angleRange) - angleRange) - (Math.PI / 2);

    const baseHue = Math.round(Math.random() * 360);
    const hueVariation = Math.round(Math.random() * 60);
    const getHue = () => (baseHue + Math.round(Math.random() * hueVariation * 2) - hueVariation) % 360;
    const getSaturation = () => Math.round(Math.random() * 20) + 80;
    const getValue = () => Math.round(Math.random() * 20) + 80;
    const getColor =() => HSBToRGBstring(getHue(), getSaturation(), getValue());
    
    const angleRange = Math.PI;
    const sparkleAfter = Math.random() * 2 > 1 ? (Math.random() * .5) + .5 : 1;

    const timeToLiveVariation = (Math.random() * .5) + .5;
    const maxTimeToLive = Math.floor(Math.random() * 5000) + 2000;
    const getTimeToLive = () => Math.floor(Math.random() * maxTimeToLive * timeToLiveVariation) + ((1 - timeToLiveVariation) * maxTimeToLive);

    for (let i = 0; i < numParticles; i++) {
        const angle = getAngle();
        const speed = (Math.random() * .3) + .01;
        const timeToLive = getTimeToLive();
        const size = (Math.random() * .01) + .005;
        const startVX = speed * Math.cos(angle);
        const startVY = (speed * Math.sin(angle)) - .2;
        const accX = startVX * .05;
        const accY = startVY * .05;
        const grav = .25;
        const color = getColor();
        particles.push(new FireworkParticle(timeToLive, size, startVX, startVY, accX, accY, grav, color, sparkleAfter));
    }

    this.update = (dt) => {
        if (timeUntilBegin > 0) {
            timeUntilBegin -= dt;
        }

        if (timeUntilBegin <= 0 && active) {
            let weDead = true;
            for (const particle of particles) {
                if (particle.update(dt)) {
                    weDead = false;
                }
            }
            if (weDead) {
                active = false;
            }
        }
        return active;
    };

    this.draw = (ctx, drawRect) => {
        if (timeUntilBegin <= 0 && active) {
            const baseline = Math.min(drawRect.w, drawRect.h);
            const dx = xLoc * baseline;
            const dy = yLoc * baseline;
            ctx.save();
            ctx.translate(drawRect.cx + dx, drawRect.cy + dy);
            for (const particle of particles) {
                particle.draw(ctx, drawRect);
            }
            ctx.restore();
        }
        return null;
    };
}

function FireworkParticle(timeToLive, size, startVX, startVY, accX, accY, grav, color, sparkleAfter) {
    const airResistance = -.75;
    const totalLife = timeToLive;
    let lifeRemaining = timeToLive;
    let t = 0;
    
    let x = 0;
    let y = 0;
    let vx = startVX;
    let vy = startVY;
    let ax = accX;
    let ay = accY;
    const g = grav;

    const s = size;
    const c = color;
    const sparklyAfter = sparkleAfter;

    const isActive = () => t >= 0 && t <= 1;

    this.update = (dt) => {
        lifeRemaining -= dt;
        t = lifeRemaining / totalLife;

        const tf = dt / 1000;
        //TODO: remove the ax * and ay *?
        ax += ax * airResistance;
        ay += ay * airResistance;
        ay += g;

        vx += ax * tf;
        vy += ay * tf;

        x += vx * tf;
        y += vy * tf;

        return isActive();
    };

    this.draw = (ctx, drawRect) => {
        if (isActive()) {
            const baseline = Math.min(drawRect.w, drawRect.h);
            const r = .5 * s * baseline;
            const px = x * baseline;
            const py = y * baseline;

            ctx.save();
            if (t < 1 - sparklyAfter) {
                const tH = Math.floor(t * 100);
                const f = (t * 100) - tH;
                if (f < .5) {
                    ctx.beginPath();
                    ctx.arc(px, py, r, 0, Math.PI * 2, false);
                    ctx.fillStyle = 'rgb(250,250,250)';
                    ctx.fill();
                }
            }
            else {
                ctx.beginPath();
                ctx.arc(px, py, r, 0, Math.PI * 2, false);
                ctx.fillStyle = c;
                ctx.fill();
            }
            ctx.restore();
        }
        return null;
    };
}

function FireworkLaunchTrailParticle(timeToLive, locX, locY, maxSize) {
    const totalLife = timeToLive;
    let lifeRemaining = timeToLive;
    let t = 0;
    
    const x = locX;
    const y = locY;
    const targetSize = maxSize;

    const s = () => targetSize * (1 - t);
    //TODO: the base color could be randomized/passed-in maybe? I dunno...
    const c = () => `rgba(100,100,100,${t.toFixed(3)})`;

    const isActive = () => t >= 0 && t <= 1;

    this.update = (dt) => {
        lifeRemaining -= dt;
        t = lifeRemaining / totalLife;
        return isActive();
    };

    this.draw = (ctx, drawRect) => {
        if (isActive()) {
            const baseline = Math.min(drawRect.w, drawRect.h);
            const r = .5 * s() * baseline;
            const px = x * baseline;
            const py = y * baseline;

            ctx.save();
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2, false);
            ctx.fillStyle = c();
            ctx.fill();
            ctx.restore();
        }
        return null;
    };
}