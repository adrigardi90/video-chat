export const log = (arg) => {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(`${now}: ${arg}`);
}