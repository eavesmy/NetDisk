package model

type User struct {
}

type Login struct {
	Pwd string `json:"pwd"`
}

func (a *Login) Validate() error {
	return nil
}
