package model

import "time"

type Assets struct {
	FileName   string
	LastModify time.Time
	Size       int64
	Type       string
	IsDir      bool
	Path       string
}

type ReqAssets struct {
	Path string
	Type string
}

func (a *ReqAssets) Validate() error {
	return nil
}

type ReqGetAsset struct {
	Src string
}

func (a *ReqGetAsset) Validate() error {
	return nil
}
