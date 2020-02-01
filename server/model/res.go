package model

type Res struct {
	Msg  string
	Data interface{}
}

func NewRes() *Res {
	return &Res{
		Msg: "success",
	}
}
