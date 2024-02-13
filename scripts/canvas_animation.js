function DrawBoundsRect(xLoc, yLoc, width, height) {
    this.x = xLoc;
    this.y = yLoc;
    this.w = width;
    this.h = height;
    this.cx = this.x + (width/2);
    this.cy = this.y + (height/2);
}

function LayeredAnimationCollection() {
    const layers = [];

    this.addLayer = (newLayer) => {
        layers.push(newLayer);
    };

    this.update = (dt) => {
        let isAlive = false;
        for (let layer of layers) {
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
        for (let layer of layers) {
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
function CountdownAnimationContainer(totalTime, updateFunc, animateFunc) {
    const totalAnimationTime = totalTime;
    let timeRemaining = totalTime;
    const updater = updateFunc;
    const animator = animateFunc;
    let t = 0;

    const isActive = () => t >= 0 && t <= 1;

    this.update = (dt) => {
        timeRemaining -= dt;
        t = updater(timeRemaining, totalAnimationTime);
        return isActive();
    };

    this.draw = (ctx, drawRect) => {
        if (isActive()) {
            return animator(ctx, drawRect, t);
        }
        return null;
    };
}