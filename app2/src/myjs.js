export default {
  fnMaxWin: function (szId) {
    const o = document.getElementById(szId)
    o.className = o.className + ' maxWin'
  },
  fnMinWin: function (szId) {
    const o = document.getElementById(szId)
    o.className = 'el-card is-hover-shadow'
  },
  fnFullScreen: function (szId) {
    /* Get into full screen */
    function GoInFullscreen (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen()
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
      }
    }
    GoInFullscreen(document.getElementById(szId))
  },
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
