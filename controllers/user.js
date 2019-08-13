var {
    Email,
    Head
} = require('../untils/config.js')
var UserModel = require('../models/user.js')
var fs = require('fs')
var url = require('url')
var {
    setCrypto,
    createVerify
} = require('../untils/base.js')
var login = async (req, res, next) => {
    var {
        username,
        password,
        verifyImg
    } = req.body

    if (verifyImg !== req.session.verifyImg) {
        res.send({
            msg: '验证码输入不正确',
            statis: -1
        })
        return;
    }

    var result = await UserModel.findLogin({
        username,
        password: setCrypto(password)
    });

    if (result) {
        req.session.username = username
        req.session.isAdmin = result.isAdmin
        req.session.userHead = result.userHead
        if (result.isFreeze) {
            res.send({
                msg: '账号已冻结',
                status: -2
            });
        } else {
            res.send({
                msg: '登录成功',
                status: 0
            });
        }
    } else {
        res.send({
            msg: '登录失败',
            status: -3
        });
    }
};
var register = async (req, res, next) => {

    var {
        username,
        password,
        email,
        verify
    } = req.body

    if (email !== req.session.email || verify !== req.session.verify) {
        res.send({
            msg: '验证码错误',
            status: 0
        })
    }
    // 验证时间
    if ((Email.time - req.session.time) / 1000 > 60) {
        res.send({
            msg: '验证码已过期',
            status: -3
        })
        return
    }

    // 对注册的处理
    var result = await UserModel.save({
        username,
        password: setCrypto(password), // 加密
        email
    });

    if (result) {
        res.send({
            msg: '注册成功',
            status: 0
        });
    } else {
        res.send({
            msg: '注册失败',
            status: -2
        });
    }
};
var verify = async (req, res, next) => {
    var email = req.query.email;
    var verify = Email.verify

    req.session.verify = verify
    req.session.email = email
    req.session.time = Email.time // 记录时间，方便倒计时
    var mailOptions = {
        from: '洪师傅 528192663@qq.com', // sender address
        to: email, // list of receivers
        subject: "今天你学习了么", // Subject line "验证码" + Email.verify
        text: '验证码' + verify
    }

    Email.transporter.sendMail(mailOptions, (err) => {
        if (err) {
            res.send({
                msg: '验证码发送失败',
                status: -1
            })
        } else {
            res.send({
                msg: '验证码发送成功',
                status: 0
            })
        }
    })


};
var logout = async (req, res, next) => {
    console.log('原来的' + req.session.username)
    req.session.username = '',
        console.log(req.session.username)
    res.send({
        msg: '退出成功',
        status: 0
    })
};
var getUser = async (req, res, next) => {

    console.log(req.session)
    if (req.session.username) {
        res.send({
            msg: '获取用户信息成功',
            status: 0,
            data: {
                username: req.session.username,
                isAdmin: req.session.isAdmin,
                userHead: req.session.userHead
            }
        })
    } else {
        res.send({
            msg: '获取用户信息失败',
            status: -1
        })
    };
};
var updatePassword = async (req, res, next) => {
    var {
        email,
        password,
        verify
    } = req.body
    if (email === req.session.email && verify === req.session.verify) {
        var result = await UserModel.updatePassword(email, setCrypto(password))
        if (result) {
            res.send({
                msg: '修改密码成功',
                status: 0
            });
        } else {
            res.send({
                msg: '修改密码失败',
                status: -1
            })
        }
    } else {
        res.send({
            msg: '验证码失败',
            status: -1
        })
    }
};

var verifyImg = async (req, res, next) => {
    var result = await createVerify(req, res);
    if (result) {
        res.send(result)
    }
}

var uploadUserHead = async (req, res, next) => {
    // 必须写上err
    // console.log(req.body)
    // var imgType = req.body.type.slice(req.body.type.lastIndexOf("."))
    // console.log(img)
    await fs.rename('public/upload/' + req.file.filename, 'public/upload/' + req.session.username + '.jpg', (err) => {
        if (err) {
            throw err
        } else {
            console.log('done!')
        }
    })

    var result = await UserModel.uploadUserHead(req.session.username, url.resolve(Head.baseUrl, req.session.username + '.jpg'))
    if (result) {
        res.send({
            msg: '头像更新成功',
            status: 0,
            data: {
                userHead: url.resolve(Head.baseUrl, req.session.username + '.jpg')
            }
        })
    } else {
        res.send({
            msg: '头像更新失败',
            status: -1
        })
    }
}

module.exports = {
    login,
    register,
    verify,
    logout,
    getUser,
    updatePassword,
    verifyImg,
    uploadUserHead
}