Page({
    onLoad: () => {
        import('../../models/ClientTestBrowserify');
    },
    toBinary: () => {
        wx.navigateTo({
            url: '/pages/binary/index'
        })
    }
})