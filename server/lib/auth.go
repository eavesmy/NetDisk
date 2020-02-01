package lib

import (
	// "errors"
	"encoding/hex"
	"github.com/eavesmy/golang-lib/auth"
	"github.com/eavesmy/golang-lib/crypto"
	"github.com/teambition/gear"
)

func Auth(ctx *gear.Context) error {
	token := ctx.GetHeader("token")

	if token == "" {
		return ctx.HTML(403, "no access")
	}

	src_token, _ := hex.DecodeString(token)

	id := crypto.Rc4(string(src_token), Config.Secret)

	exists, _ := auth.Exists(id)

	if !exists {
		return ctx.HTML(403, "token expired")
	}

	token = crypto.Rc4(id, Config.Secret)

	token = hex.EncodeToString([]byte(token))

	ctx.SetHeader("token", token)

	return nil
}
