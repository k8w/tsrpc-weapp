Page({
    onLoad: () => {
        import('../../models/ClientTest');
    },
    toBinary: () => {
        wx.navigateTo({
            url: '/pages/binary/index'
        })
    }
})