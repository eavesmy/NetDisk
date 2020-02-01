package handler

import (
	"../lib"
	"../model"
	"github.com/teambition/gear"
)

func Assets(ctx *gear.Context) error { // 获取存储的资源
	res := model.NewRes()

	p := model.ReqAssets{}
	ctx.ParseBody(&p)

	res.Data = lib.GetByCondition(p.Type, p.Path)

	return ctx.JSON(200, res)
}

func Info(ctx *gear.Context) error {
	res := model.NewRes()
	res.Data = lib.GetDbInfo()

	return ctx.JSON(200, res)
}

func Get(ctx *gear.Context) error {
	res := model.NewRes()

	p := model.ReqGetAsset{}
	ctx.ParseBody(&p)

	res.Data = lib.GetAsset(p.Src)

	return ctx.JSON(200, res)
}

func Redirect(ctx *gear.Context) error {
	return ctx.Redirect("http://localhost:5000")
}
