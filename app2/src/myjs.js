module.exports = {
  fnAutoFocus: function () {
    document.body.onkeydown = function (event) {
      const e = event || (window.event ? window.event : null)
      // 按下回车键且输入框值非空时
      if (e.keyCode === 13) {
        e.keyCode = 9
        return true
      }
    }
  }
}
