package main

import (
	"./handler"
	"./lib"
	"./model"
	"encoding/json"
	"fmt"
	"github.com/teambition/gear"
	"io/ioutil"
)

var id string

func init() {

	config := model.NewConfig()

	b, err := ioutil.ReadFile("./config")
	if err != nil {
		return
	}

	json.Unmarshal(b, &config)

	id = config.Id

	lib.DbInit(config)
}

func main() {

	app := gear.New()
	router := gear.NewRouter()

	router.Post("/disk/login", handler.Login)
	router.Post("/disk/info", lib.Auth, handler.Info)
	router.Post("/disk/assets", lib.Auth, handler.Assets)
	router.Post("/disk/assets/:path", lib.Auth, handler.Assets)
	router.Post("/disk/get", lib.Auth, handler.Get)

	/*
		router.Options("/api/Assets", func(ctx *gear.Context) error {
			fmt.Println("optin")
			return ctx.HTML(200, "")
		})
	*/

	app.Use(func(ctx *gear.Context) error {

		ctx.SetHeader("Access-Control-Allow-Origin", "https://disk.eva7base.com")
		ctx.SetHeader("Access-Control-Expose-Headers", "token,Content-disposition, Content-Type,Cache-control")
		ctx.SetHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,TRACE")
		ctx.SetHeader("Access-Control-Allow-Headers", "Content-Type,Origin,Accept,x-access-token,token,Set-Cookie,credentials,token")
		ctx.SetHeader("Access-Control-Max-Age", "3600")
		ctx.SetHeader("Access-Control-Allow-Credentials", "true")

		if ctx.Method == "OPTIONS" {
			return ctx.HTML(204, "ok")
		}

		fmt.Println(" ---->", ctx.Method, ctx.Path)

		res := model.NewRes()

		if ctx.GetHeader("x-access-token") != id {
			res.Msg = "no access"
			return ctx.JSON(500, res)
		}
		return nil
	})

	app.UseHandler(router)

	app.Listen(":9092")
}
