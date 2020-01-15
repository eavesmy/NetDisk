package main

import (
	"./handler"
	"./lib"
	"./model"
	"encoding/json"
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
	router.Post("/api/assets", handler.Assets)

	app.Listen(":8080")
}
