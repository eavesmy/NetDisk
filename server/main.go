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

func init() {

	config := model.NewConfig()

	b, err := ioutil.ReadFile("./config")
	if err != nil {
		return
	}

	json.Unmarshal(b, &config)

	lib.DbInit(config)
}

func main() {

	app := gear.New()
	router := gear.NewRouter()

	router.Post("/api/Login", handler.Login)
	router.Post("/api/info", handler.Info)
	router.Post("/api/assets", handler.Assets)
	router.Post("/api/assets/:path", handler.Assets)
	router.Post("/api/get", handler.Get)

	/*
		router.Options("/api/Assets", func(ctx *gear.Context) error {
			fmt.Println("optin")
			return ctx.HTML(200, "")
		})
	*/

	app.Use(func(ctx *gear.Context) error {

		ctx.SetHeader("Access-Control-Allow-Origin", "*")
		ctx.SetHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,TRACE")
		ctx.SetHeader("Access-Control-Allow-Headers", "Content-Type,Origin,Accept,x-access-token")
		ctx.SetHeader("Access-Control-Max-Age", "3600")
		ctx.SetHeader("Access-Control-Allow-Credentials", "true")

		fmt.Println(" ---->", ctx.Method, ctx.Path)

		res := model.NewRes()

		if ctx.GetHeader("x-access-token") != "123" {
			res.Msg = "no access"
			return ctx.JSON(500, res)
		}
		return nil
	})

	app.UseHandler(router)

	app.Listen(":8080")
}
