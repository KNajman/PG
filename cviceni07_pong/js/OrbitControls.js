// if key up is pressed
if (keyIsDown(UP_ARROW)) {
    // move the paddle up
    paddle1.y -= 5;
}
// if key down is pressed
if (keyIsDown(DOWN_ARROW)) {
    // move the paddle down
    paddle1.y += 5;
}
// if key W is pressed
if (keyIsDown(87)) {
    // move the paddle up
    paddle2.y -= 5;
}
// if key S is pressed
if (keyIsDown(83)) {
    // move the paddle down
    paddle2.y += 5;
}