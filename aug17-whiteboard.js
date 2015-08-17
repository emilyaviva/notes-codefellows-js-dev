// Find the height of a binary search tree

function height(t, h) {
  if (!h) h = 0;
  if (!t) return h;
  var l = height(t.left, h + 1);
  var r = height(t.right, h + 1);
  return Math.max(l, r) - 1;
}
