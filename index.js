module.exports = function(source, u, componentA, componentB, mSelector, aSelector) {
    
    if(typeof source !== "object") {
        aSelector = mSelector;
        mSelector = componentB;
        componentB = componentA;
        componentA = source;
        u = source;
        source = this;
    }
    
    if(typeof u !== "number") {
        u = 0.25;
    }
    
    if (typeof componentA !== 'function') {
        componentA = defaultXSelector;
    }
    if (typeof componentB !== 'function') {
        componentB = defaultYSelector;
    }
    if (typeof mSelector !== 'function') {
        mSelector = defaultMSelector;
    }
    if (typeof aSelector !== 'function') {
        aSelector = defaultASelector;
    }
    
    var latest = null;

    return source.doAction(saveLatest).concat(fakeDrags());

    function saveLatest(val) {
        latest = val;
    };

    function fakeDrags() {
        return Rx.Observable.defer(function() {
            
            if (latest == null) {
                return Rx.Observable.empty();
            }
            
            var deceleration = Math.abs(u * 9.8);
            
            return Rx.Observable.create(function(observer) {
                // var scheduler = Rx.Scheduler.timeout;
                var scheduler = Rx.Scheduler.requestAnimationFrame || Rx.Scheduler.timeout;
                return scheduler.scheduleRecursive(function(reschedule) {
                    observer.onNext(0);
                    reschedule();
                });
            })
            .scan(latest, decelerate)
            .takeWhile(hasVelocity);
            
            function decelerate(memo, b) {
                var magnitude = mSelector(memo),
                    angle = aSelector(memo),
                    vx = magnitude * Math.cos(angle),
                    vy = magnitude * Math.sin(angle),
                    x = componentA(memo) + vx,
                    y = componentB(memo) + vy;
                magnitude -= deceleration;
                return {
                    x: x,
                    y: y,
                    angle: angle,
                    magnitude: magnitude
                };
            }
            
            function hasVelocity(drag) {
                return drag.magnitude > 0;
            }
        });
    }
};

function defaultXSelector (m) { return m.x; };
function defaultYSelector (m) { return m.y; };
function defaultMSelector (m) { return m.magnitude; };
function defaultASelector (m) { return m.angle; };
