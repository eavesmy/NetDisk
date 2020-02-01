package handler

import (
	"../lib"
	"../model"
	"encoding/hex"
	"github.com/eavesmy/golang-lib/auth"
	"github.com/eavesmy/golang-lib/crypto"
	"github.com/go-http-utils/cookie"
	"github.com/teambition/gear"
)

func Login(ctx *gear.Context) error {
	res := model.NewRes()
	login := &model.Login{}
	ctx.ParseBody(login)

	pwd := crypto.Md5(login.Pwd)

	if pwd != crypto.Md5(crypto.Md5(lib.Config.Secret)) {
		res.Msg = "No access"
		return ctx.JSON(403, res)
	}

	option := &cookie.Options{
		MaxAge: 36000,
		// Domain:   "disk.eva7base.com",
		Domain:   "localhost",
		Secure:   false,
		HTTPOnly: true,
		Signed:   false,
	}

	// 解码 value 能找到id,key
	session := auth.NewSession(option)
	token := crypto.Rc4(session.Id, lib.Config.Secret)
	token = hex.EncodeToString([]byte(token))

	ctx.SetHeader("token", token)

	return ctx.JSON(200, res)
}
